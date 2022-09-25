import express from "express";
import { createUser, getUserDetails } from "../controllers/userController";
import { adminsOnly, authenticate } from "../middleware/authMiddleware";

export const router = express.Router();

router.post("/", authenticate, adminsOnly, createUser);
router.get("/:userId", authenticate, adminsOnly, getUserDetails);

module.exports = { router };
