import express from "express";
import {
  createUser,
  getUserDetails,
  getAllUsers,
  updateUser,
} from "../controllers/userController";
import { adminsOnly, authenticate } from "../middleware/authMiddleware";

export const router = express.Router();

router.get("/", authenticate, adminsOnly, getAllUsers);
router.post("/", authenticate, adminsOnly, createUser);
router.get("/:userId", authenticate, adminsOnly, getUserDetails);
router.patch("/:userId", authenticate, updateUser);

module.exports = { router };
