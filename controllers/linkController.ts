import { Request, Response } from "express";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import db from "../models";
import { getOrgId } from "../utils/apiutils";
import { linkTypes } from "../utils/defaults";

export const createLink = (req: Request, res: Response) => {
  const DB: any = db;
  const { link } = DB;

  const shortLink: string = req.body["shortLink"];
  const fullUrl: string = req.body["fullUrl"];
  const description: string = req.body["description"];
  const type: linkTypes = req.body["type"];
  const isPrivate: boolean = req.body["private"];

  const requiredFields = ["shortLink", "fullUrl", "type", "private"];
  for (let i of requiredFields) {
    if (req.body[i] == null) {
      return res.status(400).json({
        error: `Required field \`${i}\` not provided or null`,
      });
    }
  }

  if (!Object.values(linkTypes)?.includes(type)) {
    return res.status(400).json({
      error: `\`type\` can only be \`static\` or \`dynamic\``,
    });
  }

  const createdBy = req.auth.userId;
  const orgId = getOrgId(req);

  link
    .create({
      id: uuidv4(),
      orgId: orgId,
      shortLink: shortLink,
      fullUrl: fullUrl,
      description: description,
      private: isPrivate,
      type: type,
      createdBy: createdBy,
      active: true,
    })
    .then((data: typeof link) => {
      return res.status(200).json({
        id: data.id,
        shortLink: data.shortLink,
        description: data.description,
        type: data.type,
        private: data.private,
        createdBy: data.createdBy,
        active: data.active,
      });
    })
    .catch(() => {
      if (typeof isPrivate !== "undefined" && isPrivate == true) {
        return res
          .status(400)
          .json({ error: "This private shortlink is already defined" });
      } else {
        return res
          .status(400)
          .json({ error: "This shortlink is already defined for your org" });
      }
    });
};

export const getLinkDetails = (req: Request, res: Response) => {
  const DB: any = db;
  const { link } = DB;

  const linkId = req.params.linkId;
  if (linkId == null) {
    return res.status(400).json({
      error: "Required param `linkId` not provided or null",
    });
  }

  const orgId = getOrgId(req);
  link
    .findByPk(linkId)
    .then((data: typeof link) => {
      if (data) {
        res.json({
          id: data.id,
          orgId: orgId,
          shortLink: data.shortLink,
          fullUrl: data.fullUrl,
          description: data.description,
          private: data.private,
          type: data.type,
          createdBy: data.createdBy,
        });
      } else {
        res.status(404).json({ error: "Link with this id not found!" });
      }
    })
    .catch(() => res.json({ error: "Could not get details for id" }));
};

export const getAllLinks = (req: Request, res: Response) => {
  const DB: any = db;
  const { link } = DB;

  const orgId = getOrgId(req);
  link
    .findAll({
      where: {
        [Op.or]: [
          { orgId: orgId, private: false },
          { orgId: orgId, private: true, createdBy: req.auth.userId },
        ],
      },
    })
    .then((data: Array<any>) => {
      if (data) {
        res.json(
          data.map((data) => {
            return {
              id: data.id,
              shortLink: data.shortLink,
              fullUrl: data.fullUrl,
              description: data.description,
              private: data.private,
              createdBy: data.createdBy,
              type: data.type,
            };
          })
        );
      } else {
        res.json({});
      }
    })
    .catch(() =>
      res.status(500).json({ error: `Unable to get links for user` })
    );
};

export const updateLink = (req: Request, res: Response) => {
  const DB: any = db;
  const { link } = DB;

  const linkId = req.params.linkId;
  if (linkId == null) {
    return res.status(400).json({
      error: "Required param `linkId` not provided or null",
    });
  }

  const orgId = getOrgId(req);
  const updateRule = { orgId: orgId, id: linkId };

  // non admins can only update links they created
  if (req.auth.userRole !== "admin" && req.auth.userRole !== "global_admin") {
    Object.assign(updateRule, { createdBy: req.auth.userId });
  }
  link
    .update(req.body, {
      where: updateRule,
      returning: true,
    })
    .then((data: any) => {
      if (data[0] == 1) {
        return res.send({
          id: data[1][0].dataValues.id,
          orgId: data[1][0].dataValues.orgId,
          shortLink: data[1][0].dataValues.shortLink,
          fullUrl: data[1][0].dataValues.fullUrl,
          description: data[1][0].dataValues.description,
          private: data[1][0].dataValues.private,
          type: data[1][0].dataValues.type,
          createdBy: data[1][0].dataValues.createdBy,
        });
      } else {
        return res.status(404).json({ error: "Link with this id not found!" });
      }
    })
    .catch(() => res.json({ error: "Could not get details for id" }));
};

export const deleteLink = (req: Request, res: Response) => {
  const DB: any = db;
  const { link } = DB;

  const linkId = req.params.linkId;
  if (linkId == null) {
    return res.status(400).json({
      error: "Required param `linkId` not provided or null",
    });
  }
  const orgId = getOrgId(req);

  const deleteRule = { orgId: orgId, id: linkId };

  // non admins can only delete links they created
  if (req.auth.userRole !== "admin" && req.auth.userRole !== "global_admin") {
    Object.assign(deleteRule, { createdBy: req.auth.userId });
  }

  link
    .destroy({
      where: deleteRule,
    })
    .then((data: any) => {
      if (data == 1) {
        return res.status(200).json({ status: `OK` });
      } else {
        return res
          .status(400)
          .json({ error: `Unable to delete shortlink. Contact your admin/s.` });
      }
    })
    .catch(() =>
      res.status(500).json({ error: `Error when deleting shortlink` })
    );
};
