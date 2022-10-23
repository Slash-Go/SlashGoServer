import express from "express";
import {
  login,
  loginGoogle,
  refreshToken,
  resetPassword,
  resetPasswordRequest,
} from "../controllers/authController";

export const router = express.Router();

router.post("/login", login);
router.post("/login_google", loginGoogle);
router.post("/refresh", refreshToken);
router.post("/reset_password_request", resetPasswordRequest);
router.post("/reset_password", resetPassword);

module.exports = { router };
