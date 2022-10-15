import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db, { sequelize } from "../models";
import { getOrgId } from "../utils/apiutils";
import { DEFAULT_ORG_HERO } from "../utils/defaults";

export const createOrganization = (req: Request, res: Response) => {
  const DB: any = db;
  const { organization } = DB;

  const licenses = req.body["licenses"];
  const orgName = req.body["orgName"];
  const orgHero = req.body["orgHero"];

  if (licenses == null || !Number.isInteger(licenses) || licenses <= 0) {
    return res.status(401).json({
      error:
        "Required parameter `licenses` not provided, null or invalid number",
    });
  }

  if (orgName == null || orgName === "") {
    return res
      .status(401)
      .json({ error: "Required parameter `orgName` not provided or null" });
  }

  if (orgHero != null && orgHero.length > 15) {
    return res
      .status(401)
      .json({ error: "`orgHero` cannot be more than 15 characters long" });
  }

  organization
    .create({
      id: uuidv4(),
      name: orgName,
      licenses: licenses,
      active: true,
      orgHero: orgHero == null ? DEFAULT_ORG_HERO : orgHero,
    })
    .then((data: typeof organization) => {
      res.status(200).json({
        orgId: data.id,
        orgName: data.orgName,
        licenses: data.licenses,
        orgHero: data.orgHero,
        active: data.active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    })
    .catch((err: any) => {
      res.status(500).json({ error: `Unable to create new organization` });
    });
};

export const getOrgDetails = (req: Request, res: Response) => {
  const DB: any = db;
  const { organization } = DB;

  const orgId = getOrgId(req);

  if (orgId == null || orgId === "") {
    return res
      .status(401)
      .json({ error: "Required parameter `orgId` not provided or null" });
  }

  if (req.auth.userRole !== "global_admin" && req.auth.orgId != orgId) {
    return res.status(401).json({
      error: "Cannot get information for orgId that you don't belong to",
    });
  }

  organization
    .findByPk(orgId)
    .then((data: typeof organization) => {
      if (data) {
        res.status(200).json({
          orgId: data.id,
          orgName: data.name,
          licenses: data.licenses,
          orgHero: data.orgHero,
          active: data.active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        res
          .status(404)
          .json({ error: `Unable to find organization with orgId ${orgId}` });
      }
    })
    .catch(() =>
      res.status(500).json({ error: "Could not create organization" })
    );
};

export const updateOrgDetails = (req: Request, res: Response) => {
  const DB: any = db;
  const { organization } = DB;

  const orgId = getOrgId(req);

  if (orgId !== req.params.orgId) {
    return res.status(401).json({
      error: "Cannot update org details for an org you don't belong to",
    });
  }

  if (
    (req.body["name"] != null ||
      req.body["licenses"] != null ||
      req.body["active"] != null) &&
    req.auth.userRole !== "global_admin"
  ) {
    return res.status(401).json({
      error:
        "Attempted to update fields which can only be updated by global admins",
    });
  }

  const payload = generateOrgPayload(req);
  organization
    .update(payload, {
      where: { id: orgId },
    })
    .then((data: any) => {
      if (data) {
        res.status(200).json({ message: "Successfully updated org details!" });
      } else {
        res.status(404).json({ error: "Organization with this id not found!" });
      }
    })
    .catch(() =>
      res
        .status(500)
        .json({ error: "Could not update details for organization" })
    );
};

export const deactivateOrganization = (req: Request, res: Response) => {
  const DB: any = db;
  const { organization } = DB;

  const orgId = req.params.orgId;

  if (orgId == null || orgId === "") {
    return res
      .status(401)
      .json({ error: "Required parameter `orgId` not provided or null" });
  }

  if (req.auth.userRole !== "global_admin") {
    return res.status(401).json({
      error: "Only Global Admins can delete orgs!",
    });
  }

  organization
    .update(
      { active: false, updatedAt: sequelize.fn("NOW") },
      { where: { id: orgId, active: true } }
    )
    .then((data: any) => {
      console.log(data);
      if (data == 1) {
        return res.status(200).json({ status: `OK` });
      } else {
        return res.status(404).json({ error: `Unable to find organization` });
      }
    });
};

const generateOrgPayload = (req: Request) => {
  const payload: any = {};
  payload["orgHero"] = req.body.orgHero;
  payload["updatedAt"] = sequelize.fn("NOW");

  return payload;
};
