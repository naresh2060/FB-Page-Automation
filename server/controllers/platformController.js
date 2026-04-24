import { debugToken, getUserPages, getPageDetails } from "../services/facebookServices.js";
import Platform from "../models/Platform.js";

const REQUIRED_SCOPES = ["pages_show_list", "pages_read_engagement"];

export const checkFacebookConnection = async (req, res) => {
  const { pageId, accessToken } = req.body;

  // ── 1. Input presence check ──────────────────────────────────
  if (!pageId || !accessToken) {
    return res.status(400).json({
      success: false,
      error: "MISSING_FIELDS",
      message: "Both pageId and accessToken are required",
    });
  }

  // ── 2. Input format check ────────────────────────────────────
  if (!/^\d+$/.test(pageId.trim())) {
    return res.status(400).json({
      success: false,
      error: "INVALID_PAGE_ID_FORMAT",
      message: "Page ID must be numeric",
    });
  }

  if (accessToken.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: "INVALID_TOKEN_FORMAT",
      message: "Access token is too short to be valid",
    });
  }

  // ── 3. Debug token ────────────────────────────────────────────
  let tokenInfo;
  try {
    tokenInfo = await debugToken(accessToken.trim());
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "TOKEN_DEBUG_FAILED",
      message: "Could not verify token with Facebook",
      detail: err.message,
    });
  }

  if (!tokenInfo.is_valid) {
    return res.status(401).json({
      success: false,
      error: "TOKEN_INVALID",
      message: "This access token is invalid or has been revoked",
    });
  }

  // ── 4. Check token expiry ─────────────────────────────────────
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (tokenInfo.expires_at && tokenInfo.expires_at < nowInSeconds) {
    return res.status(401).json({
      success: false,
      error: "TOKEN_EXPIRED",
      message: "This access token has expired",
      expiredAt: new Date(tokenInfo.expires_at * 1000),
    });
  }

  // ── 5. Check required permissions ────────────────────────────
  const grantedScopes = tokenInfo.scopes || [];
  const missingScopes = REQUIRED_SCOPES.filter((s) => !grantedScopes.includes(s));

  if (missingScopes.length > 0) {
    return res.status(403).json({
      success: false,
      error: "MISSING_PERMISSIONS",
      message: "Token is missing required Facebook permissions",
      missingScopes,
      grantedScopes,
    });
  }

  // ── 6. Verify page is managed by token owner ─────────────────
  let userPages;
  try {
    userPages = await getUserPages(accessToken.trim());
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "PAGES_FETCH_FAILED",
      message: "Failed to retrieve pages managed by this token",
      detail: err.message,
    });
  }

  const managedPage = userPages.find((p) => p.id === pageId.trim());

  if (!managedPage) {
    return res.status(403).json({
      success: false,
      error: "PAGE_NOT_MANAGED",
      message: "This token does not have access to the specified page",
      hint: "Ensure you are an admin of this Facebook page",
    });
  }

  // ── 7. Fetch full page details ────────────────────────────────
  let pageDetails;
  try {
    pageDetails = await getPageDetails(pageId.trim(), accessToken.trim());
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: "PAGE_NOT_FOUND",
      message: "Could not retrieve page details from Facebook",
      detail: err.message,
    });
  }

  // ── 8. Save / update Platform document ───────────────────────
  try {
    await Platform.findOneAndUpdate(
      {
        userId:   req.user._id,          // assumes auth middleware sets req.user
        platform: "facebook",
        "profile.platformUserId": pageId.trim(),
      },
      {
        $set: {
          status:         "connected",
          accessToken:    accessToken.trim(),
          refreshToken:   "",             // Facebook doesn't issue refresh tokens
          tokenExpiresAt: tokenInfo.expires_at
            ? new Date(tokenInfo.expires_at * 1000)
            : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // fallback: 60 days

          profile: {
            platformUserId: pageDetails.id,
            username:       pageDetails.name,
            displayName:    pageDetails.name,
            profileImage:   pageDetails.picture?.data?.url || null,
            followersCount: pageDetails.fan_count || 0,
            followingCount: 0,           // FB pages don't expose following count
          },

          connectedAt: new Date(),
        },
      },
      {
        upsert:    true,   // create if doesn't exist
        new:       true,   // return updated doc
        runValidators: true,
      }
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      error:   "DB_SAVE_FAILED",
      message: "Page verified but failed to save to database",
      detail:  err.message,
    });
  }

  // ── 9. All checks passed — respond ───────────────────────────
  return res.status(200).json({
    success: true,
    message: "Facebook page connected successfully",
    page: {
      id:       pageDetails.id,
      name:     pageDetails.name,
      category: pageDetails.category,
      fanCount: pageDetails.fan_count   || 0,
      picture:  pageDetails.picture?.data?.url || null,
      verified: pageDetails.verification_status === "verified",
      link:     pageDetails.link || null,
    },
    token: {
      scopes:      grantedScopes,
      expiresAt:   tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000) : null,
      isLongLived: !tokenInfo.expires_at,
    },
  });
};