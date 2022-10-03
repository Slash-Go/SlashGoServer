import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import db from "../models";
import { getOrgId } from "../utils/apiutils";

export const createUser = (req: Request, res: Response) => {
  const DB: any = db;
  const { user } = DB;

  // TODO: API Validations
  // TODO: email is of email format
  const email = req.body["email"];
  const firstName = req.body["firstName"];
  const lastName = req.body["lastName"];

  const password = req.body["password"];
  // TODO: Make this async
  const salt = bcrypt.genSaltSync(10);
  const hashedPass = bcrypt.hashSync(password, salt);

  const orgId = getOrgId(req);

  // TODO: Admin should not be able to create global admin
  const role = req.body["role"];
  user
    .create({
      id: uuidv4(),
      orgId: orgId,
      email: email,
      firstName: firstName,
      role: role,
      lastName: lastName,
      password: hashedPass,
      active: true,
    })
    .then((data: typeof user) => {
      res.status(200).json({
        email: data.email,
        role: data.role,
        orgId: data.orgId,
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        active: data.active,
      });
    });
};

export const getUserDetails = (req: Request, res: Response) => {
  const DB: any = db;
  const { user, organization } = DB;

  // TODO: API Validations
  const userId = req.params.userId;
  const orgId = getOrgId(req);
  user
    .findOne({
      where: {
        id: userId,
        orgId: orgId,
      },
      include: [
        {
          model: organization,
          where: {
            active: true,
          },
          required: true,
        },
      ],
    })
    .then((data: typeof user) => {
      if (data) {
        return res.status(200).json({
          email: data.email,
          role: data.role,
          orgId: data.orgId,
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          active: data.active,
        });
      } else {
        return res
          .status(404)
          .json({ error: "Could not fine user with that id" });
      }
    })
    .catch(() =>
      res.status(500).json({ error: "Unable to get user information" })
    );
};
