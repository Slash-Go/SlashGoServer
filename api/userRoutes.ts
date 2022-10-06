import express from "express";
import {
  createUser,
  getUserDetails,
  getAllUsers,
  updateUser,
  inviteUser,
  acceptInvite,
} from "../controllers/userController";
import { adminsOnly, authenticate } from "../middleware/authMiddleware";

export const router = express.Router();

router.get("/", authenticate, adminsOnly, getAllUsers);
router.post("/", authenticate, adminsOnly, createUser);
router.post("/invite", authenticate, adminsOnly, inviteUser);
router.get("/:userId", authenticate, adminsOnly, getUserDetails);
router.patch("/:userId", authenticate, updateUser);
router.post("/accept_invite", acceptInvite);

module.exports = { router };
