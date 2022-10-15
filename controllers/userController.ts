import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import db from "../models";
import { getOrgId } from "../utils/apiutils";
import { randomUUID } from "crypto";

export const createUser = (req: Request, res: Response) => {
  addUser(req)
    .then((data) =>
      res.status(200).json({
        email: data.email,
        role: data.role,
        orgId: data.orgId,
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    )
    .catch(() => res.status(500).json({ error: "Unable to create user" }));
};

export const inviteUser = (req: Request, res: Response) => {
  req.body.password = randomUUID();

  addUser(req)
    .then((data) => {
      res.status(200).json({
        email: data.email,
        role: data.role,
        orgId: data.orgId,
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    })
    .catch(() => res.status(500).json({ error: "Unable to create user" }));
};

export const acceptInvite = (req: Request, res: Response) => {
  const DB: any = db;
  const { user } = DB;
  //TODO: Add Validations
  const userId = req.body["userId"];
  const password = req.body["password"];
  const token = req.body["token"];

  const salt = bcrypt.genSaltSync(10);
  const hashedPass = bcrypt.hashSync(password, salt);

  // TODO: Admin should not be able to create global admin
  const role = req.body["role"];
  user
    .update(
      {
        password: hashedPass,
        active: true,
      },
      {
        where: {
          id: userId,
          password: token,
        },
      }
    )
    .then((data: any) => {
      if (data[0] == 1) {
        return res.json({ message: "Successfully Activated Account!" });
      } else {
        return res.status(400).json({
          error: "Unable to Activate Account. Have you been invited?",
        });
      }
    })
    .catch(() => {
      return res.status(500).json({ error: "Error in Activating user" });
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

export const getAllUsers = (req: Request, res: Response) => {
  const DB: any = db;
  const { user, organization } = DB;

  const orgId = getOrgId(req);
  user
    .findAll({
      where: {
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
    .then((data: Array<typeof user>) => {
      if (data) {
        return res.status(200).json(
          data.map((data) => {
            return {
              email: data.email,
              role: data.role,
              orgId: data.orgId,
              id: data.id,
              firstName: data.firstName,
              lastName: data.lastName,
              active: data.active,
            };
          })
        );
      } else {
        return res
          .status(404)
          .json({ error: "Could not get list of users for this org" });
      }
    })
    .catch(() =>
      res.status(500).json({ error: "Unable to get user information" })
    );
};

export const updateUser = (req: Request, res: Response) => {
  const DB: any = db;
  const { user } = DB;

  // TODO: API Validations
  // TODO: Handle password update and active update
  const userId = req.params.userId;
  const orgId = getOrgId(req);
  const updateRule = { orgId: orgId, id: userId };

  // non admins can only update links they created
  if (
    req.auth.userRole !== "admin" &&
    req.auth.userRole !== "global_admin" &&
    req.auth.userId !== userId
  ) {
    return res
      .status(400)
      .json({ error: "Non-admin users can only edit their own details" });
  }

  user
    .update(req.body, {
      where: updateRule,
    })
    .then((data: any) => {
      if (data) {
        res.status(200).send(data);
      } else {
        res.status(404).json({ error: "User with this id not found!" });
      }
    })
    .catch(() => res.json({ error: "Could not get details for id" }));
};

const addUser = async (req: Request) => {
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
  return await user
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
      return {
        email: data.email,
        role: data.role,
        orgId: data.orgId,
        id: data.id,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        active: data.active,
      };
    });
};
