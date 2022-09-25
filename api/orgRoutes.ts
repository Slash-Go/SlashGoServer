import express from "express";
import {
  createOrganization,
  getOrgDetails,
} from "../controllers/organizationController";
import { authenticate, globalAdminsOnly } from "../middleware/authMiddleware";

export const router = express.Router();

router.post("/", authenticate, globalAdminsOnly, createOrganization);
router.get("/:orgId", authenticate, getOrgDetails);

module.exports = { router };
