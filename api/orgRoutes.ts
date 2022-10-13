import express from "express";
import {
  createOrganization,
  deactivateOrganization,
  getOrgDetails,
  updateOrgDetails,
} from "../controllers/organizationController";
import {
  adminsOnly,
  authenticate,
  globalAdminsOnly,
} from "../middleware/authMiddleware";

export const router = express.Router();

router.post("/", authenticate, globalAdminsOnly, createOrganization);
router.get("/", authenticate, getOrgDetails);
router.patch("/:orgId", authenticate, adminsOnly, updateOrgDetails);
router.delete(
  "/:orgId",
  authenticate,
  globalAdminsOnly,
  deactivateOrganization
);

module.exports = { router };
