import express from "express";
import {
  createLink,
  getLinkDetails,
  getAllLinks,
  updateLink,
  deleteLink,
} from "../controllers/linkController";
import { authenticate } from "../middleware/authMiddleware";

export const router = express.Router();

router.get("/", authenticate, getAllLinks);
router.post("/", authenticate, createLink);
router.patch("/:linkId", authenticate, updateLink);
router.get("/:linkId", authenticate, getLinkDetails);
router.delete("/:linkId", authenticate, deleteLink);

module.exports = { router };
