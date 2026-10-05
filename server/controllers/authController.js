import { findOrCreateFacebookUser, generateToken } from "../services/authService.js";
import { exchangeCodeForLongLivedToken, fetchFacebookProfile, getUserPages } from "../services/facebookServices.js";

export const handleFacebookCallback = async (req, res) => {
  console.log("Callback hitted");
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: "Missing authorization code" });

  try {
    const { accessToken, tokenExpiresAt } = await exchangeCodeForLongLivedToken(code);
    console.log("✅ Long Lived Token Generated");

    const profile = await fetchFacebookProfile(accessToken);
    console.log("✅ Facebook Profile Fetched:", JSON.stringify(profile, null, 2));

    const pages = await getUserPages(accessToken);

    const grantedScopes = [
      "public_profile",
      "email",
      "pages_show_list",
      "pages_read_engagement",
    ];

    const user = await findOrCreateFacebookUser({
      facebookId: profile.id,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      accessToken,
      tokenExpiresAt,
      grantedScopes,
      pages,
    });
    console.log("✅ User result:", user?._id, user?.name, user?.email);

    const token = generateToken(user._id);
    console.log("✅ Token generated, redirecting...");
    res.redirect(
       `${process.env.FRONTEND_URL}/auth/success?token=${token}&connected=facebook`
    );
  } catch (err) {
    console.error("❌ Facebook auth error:", err.response?.data || err.message);
    console.error("❌ Full error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};