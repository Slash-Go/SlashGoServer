import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import db from "../models";
import { getOrgId } from "../utils/apiutils";
import { randomUUID } from "crypto";
import { MIN_PASSWORD_LENGTH, userStatus } from "../utils/defaults";
import { sendMail } from "../services/email";

export const createUser = (req: Request, res: Response) => {
  addUser(req, userStatus.active)
    .then((data) => {
      return res.status(200).json({
        email: data.email,
        role: data.role,
        orgId: data.orgId,
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status,
      });
    })
    .catch(() => {
      return res.status(500).json({ error: "Unable to create user" });
    });
};

export const inviteUser = (req: Request, res: Response) => {
  req.body.password = randomUUID();

  addUser(req, userStatus.invited)
    .then((data) => {
      //TODO: Handle welcome email for SSO and GSuite Auth
      if (data.org.auth === "password") {
        sendMail({
          to: data.user.email,
          template: "user-invite-email",
          dynVars: {
            firstName: data.user.firstName ? data.user.firstName : "",
            lastName: data.user.lastName ? data.user.lastName : "",
            userId: data.user.id,
            orgName: data.org.orgName,
            activationCode: data.user.password,
          },
        });
      }
      return res.status(200).json({
        email: data.user.email,
        role: data.user.role,
        orgId: data.user.orgId,
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        status: data.user.status,
      });
    })
    .catch(() => {
      return res.status(500).json({ error: "Unable to create user" });
    });
};

export const acceptInvite = (req: Request, res: Response) => {
  const DB: any = db;
  const { user } = DB;
  //TODO: Add Validations
  const userId = req.body["userId"];
  const password = req.body["password"];
  const token = req.body["token"];

  if (userId == null) {
    return res.status(400).json({
      error: "Required field `userId` not provided or null",
    });
  }

  if (token == null) {
    return res.status(400).json({
      error: "Required field `token` not provided or null",
    });
  }

  if (password == null) {
    return res.status(400).json({
      error: "Required field `password` not provided or null",
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: "Required field `userId` not provided or null",
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPass = bcrypt.hashSync(password, salt);

  user
    .update(
      {
        password: hashedPass,
        status: userStatus.active,
      },
      {
        where: {
          id: userId,
          password: token,
          status: userStatus.invited,
        },
      }
    )
    .then((data: any) => {
      if (data[0] == 1) {
        return res
          .status(200)
          .json({ message: "Successfully Activated Account!" });
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
          status: data.status,
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

  // TODO: API Validations
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
              status: data.status,
            };
          })
        );
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

const addUser = async (req: Request, userStatus: userStatus) => {
  const DB: any = db;
  const { user, organization } = DB;
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
      status: userStatus,
    })
    .then((data: typeof user) => {
      return organization
        .findByPk(orgId)
        .then((org_data: typeof organization) => {
          return {
            user: {
              email: data.email,
              role: data.role,
              orgId: data.orgId,
              id: data.id,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              status: data.status,
            },
            org: {
              orgId: org_data.id,
              auth: org_data.auth,
              orgName: org_data.name,
              licenses: org_data.licenses,
              orgHero: org_data.orgHero,
              active: org_data.active,
              createdAt: org_data.created_at,
            },
          };
        });
    });
};
