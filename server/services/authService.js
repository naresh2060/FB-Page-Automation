import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { encryptToken } from './facebookServices.js';
// import { }

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '700d';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};


// Find or Create Facebook User
export const findOrCreateFacebookUser = async ({ facebookId, name, email, picture, accessToken, tokenExpiresAt, grantedScopes, pages }) => {
  let user = await User.findOne({ facebookId });

  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    user = new User({
      name,
      email: email || undefined,
      provider: "facebook",
      facebookId,
      profilePicture: picture?.data?.url || null,
    });
  }

  // console.log("Pages",pages);
  const mappedPages = (pages || []).map((p) => ({
    pageId: p.id,
    name: p.name,
    category: p.category,
    accessToken:  encryptToken(p.access_token),
    tasks: p.tasks || [],
        profilePicture: p.picture?.data?.url || null, // 🔥 added
  }));

  user.facebookId = facebookId;
  user.facebook = {
    ...user.facebook,
    facebookId,
    accessToken:encryptToken(accessToken),
    tokenExpiresAt,
    grantedScopes: grantedScopes || [],
    lastLoginAt: new Date(),
    pages: mappedPages,
  };

  await user.save();
  return user;
};