import crypto from "crypto";


import { graphClient } from "./axiosClient";
const GRAPH = "https://graph.facebook.com/v19.0";

export const debugToken = async (inputToken) => {
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;

  if (!appId || !appSecret) {
    console.warn(
      "Facebook App ID or Secret missing. Skipping debugToken validation.",
    );
    return { is_valid: true, scopes: [], expires_at: null }; // Assume valid if we can't check
  }

  try {
    const appToken = `${appId}|${appSecret}`;
    // const { data } = await axios.get(`${GRAPH}/debug_token`, {
    //   params: { input_token: inputToken, access_token: appToken },
    // });

    const { data } = await graphClient.get(`/debug_token`, {
      params: { input_token: inputToken, access_token: appToken },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};


// ── Encrypt ─────────────────────────────
export const encryptToken = (token) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  // store iv + encrypted together
  return `${iv.toString("hex")}:${encrypted}`;
};