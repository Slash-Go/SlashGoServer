import express from "express";
import {
  createOrganization,
  deactivateOrganization,
  getOrgDetails,
} from "../controllers/organizationController";
import { authenticate, globalAdminsOnly } from "../middleware/authMiddleware";

export const router = express.Router();

router.post("/", authenticate, globalAdminsOnly, createOrganization);
router.get("/:orgId", authenticate, getOrgDetails);
router.delete(
  "/:orgId",
  authenticate,
  globalAdminsOnly,
  deactivateOrganization
);

module.exports = { router };
