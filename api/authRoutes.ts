import express from "express";
import { login, refreshToken } from "../controllers/authController";

export const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);

module.exports = { router };
