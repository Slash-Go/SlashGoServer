import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../models";

export const createOrganization = (req: Request, res: Response) => {
  const DB: any = db;
  const { organization } = DB;

  const licenses = req.body["licenses"];
  const orgName = req.body["orgName"];

  if (licenses == null || licenses <= 0) {
    return res
      .status(401)
      .json({ error: "Required parameter `licenses` not provided or null" });
  }

  if (orgName == null || orgName === "") {
    return res
      .status(401)
      .json({ error: "Required parameter `orgName` not provided or null" });
  }

  organization
    .create({ id: uuidv4(), name: orgName, licenses: licenses, active: true })
    .then((data: typeof organization) => {
      res
        .status(200)
        .json({
          orgId: data.id,
          orgName: orgName,
          licenses: licenses,
          createdAt: data.created_at,
        });
    })
    .catch((err: any) => {
      res.status(500).json({ error: `Unable to create new organization` });
    });
};

export const getOrgDetails = (req: Request, res: Response) => {
  // TODO: Ensure you can only get your own org details?
  const DB: any = db;
  const { organization } = DB;

  const orgId = req.params.orgId;

  if (orgId == null || orgId === "") {
    return res
      .status(401)
      .json({ error: "Required parameter `orgId` not provided or null" });
  }

  if (req.auth.userRole !== "global_admin" && req.auth.orgId != orgId) {
    return res
      .status(401)
      .json({
        error: "Cannot get information for orgId that you don't belong to",
      });
  }

  organization.findByPk(orgId).then((data: typeof organization) => {
    if (data) {
      res
        .status(200)
        .json({
          orgId: data.id,
          orgName: data.name,
          licenses: data.licenses,
          active: data.active,
          createdAt: data.created_at,
        });
    } else {
      res
        .status(404)
        .json({ error: `Unable to find organization with orgId ${orgId}` });
    }
  });
};
