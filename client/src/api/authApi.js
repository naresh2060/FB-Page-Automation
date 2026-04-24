// api/authApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL; // http://localhost:5000


// ── Helper — get token from localStorage ─────────────────────────
const getToken = () => localStorage.getItem("token");


// ── POST /auth/register ──────────────────────────────────────────
export const registerUser = async (userData) => {
  // userData = { name, email, password }
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/register`,  // full URL
      userData,                     // body — axios auto JSON.stringify's this
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;           // axios wraps response in .data
    // returns { id, name, email, token }

  } catch (error) {
    // axios throws automatically on 4xx and 5xx — unlike fetch
    // error.response.data is what your backend sent back
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};


// ── POST /auth/login ─────────────────────────────────────────────
export const loginUser = async (credentials) => {
  // credentials = { email, password }
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
    // returns { user: { id, name, email }, token: "eyJhb..." }

  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};


// ── POST /auth/logout ────────────────────────────────────────────
export const logoutUser = async () => {
  // no body needed
  // token in header tells server who is logging out
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},                           // empty body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,  // attach token manually
        },
      }
    );
    return response.data;
    // returns { message: "Logged out successfully" }

  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};


// ── GET /auth/me ─────────────────────────────────────────────────
export const getCurrentUser = async () => {
  // GET request — no body
  // token tells server which user to return
  try {
    const response = await axios.get(
      `${BASE_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,  // attach token manually
        },
      }
    );
    return response.data;
    // returns { id, name, email, plan, avatar }

  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get user");
  }
};


// ── POST /auth/refresh ───────────────────────────────────────────
export const refreshToken = async () => {
  // asks server for a new token before old one expires
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,  // send old token
        },
      }
    );
    return response.data;
    // returns { token: "new_token_here" }

  } catch (error) {
    throw new Error(error.response?.data?.message || "Token refresh failed");
  }
};


// ── POST /auth/forgot-password ───────────────────────────────────
export const forgotPassword = async (email) => {
  // email is a plain string — wrap in object for backend
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/forgot-password`,
      { email },                    // { email } = { email: email }
      {
        headers: {
          "Content-Type": "application/json",
          // no token needed — user is not logged in
        },
      }
    );
    return response.data;
    // returns { message: "Reset email sent" }

  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send reset email");
  }
};


// ── POST /auth/reset-password ────────────────────────────────────
export const resetPassword = async (data) => {
  // data = { token: "abc123fromURL", newPassword: "newpass123" }
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/reset-password`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          // no auth token — user is not logged in
          // reset token is inside the body instead
        },
      }
    );
    return response.data;
    // returns { message: "Password updated successfully" }

  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reset password");
  }
};