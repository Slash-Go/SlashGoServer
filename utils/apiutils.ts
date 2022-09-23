import { Request } from "express";

export const getOrgId = (req: Request) => {
  if (
    req.auth.userRole == "global_admin" &&
    req.body.hasOwnProperty("orgId") &&
    req.body.orgId != null
  ) {
    return req.body.orgId;
  }
  return req.auth.orgId;
};
