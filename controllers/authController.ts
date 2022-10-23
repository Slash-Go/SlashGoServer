import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db, { sequelize } from "../models";
import { v4 as uuidv4, validate as isValidUUID } from "uuid";
import { generateTokenPair } from "../middleware/authMiddleware";
import { Op } from "sequelize";
import { MIN_PASSWORD_LENGTH, userStatus } from "../utils/defaults";
import { sendMail } from "../services/email";
import { OAuth2Client } from "google-auth-library";
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env][
  "social_login"
];

const client = new OAuth2Client(config["google_client_id"]);

export const login = (req: Request, res: Response) => {
  const DB: any = db;
  const { user, organization } = DB;

  const email = req.body["email"];
  const password = req.body["password"];

  if (email == null) {
    return res
      .status(401)
      .json({ error: "Required parameter `email` not provided or null" });
  }

  if (password == null) {
    return res
      .status(401)
      .json({ error: "Required parameter `password` not provided or null" });
  }

  user
    .findOne({
      attributes: [
        "id",
        "email",
        "role",
        "password",
        "orgId",
        "organization.org_hero",
      ],
      where: {
        email: email,
        status: userStatus.active,
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
      if (data === null) {
        return res.status(401).json({ error: "User not found or not active!" });
      }

      bcrypt.compare(password, data.password, function (err, result) {
        if (result) {
          generateTokenPair(data.id)
            .then((tokenResponse: any) => {
              // Add orgHero in token refresh response
              tokenResponse["orgHero"] = data.organization.orgHero;
              tokenResponse["role"] = data.role;
              return res.json(tokenResponse);
            })
            .catch((err: any) => {
              return res
                .status(401)
                .json({ error: "Error in Generating Tokens" });
            });
        } else {
          return res.status(401).json({ error: "Unable to authenticate user" });
        }
      });
    });
};

export const loginGoogle = (req: Request, res: Response) => {
  const DB: any = db;
  const { user, organization } = DB;

  const token = req.body["token"];
  if (token == null) {
    return res
      .status(401)
      .json({ error: "Required parameter `token` not provided or null" });
  }

  return client
    .verifyIdToken({
      idToken: token,
      audience: config["google_client_id"],
    })
    .then((ticket) => {
      const payload = ticket.getPayload();
      console.log(payload);
      if (payload == null) {
        return res
          .status(401)
          .json({ error: "Error in authenticating payload" });
      }

      user
        .findOne({
          attributes: ["id", "email", "role", "orgId", "organization.org_hero"],
          where: {
            email: payload?.email,
            status: userStatus.active,
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
          if (data === null) {
            return res
              .status(401)
              .json({ error: "User not found or not active!" });
          }

          generateTokenPair(data.id)
            .then((tokenResponse: any) => {
              // Add orgHero in token refresh response
              tokenResponse["orgHero"] = data.organization.orgHero;
              tokenResponse["role"] = data.role;
              return res.json(tokenResponse);
            })
            .catch((err: any) => {
              return res
                .status(401)
                .json({ error: "Error in Generating Tokens" });
            });
        });
    })
    .catch((e) => {
      return res
        .status(401)
        .json({ error: `Invalid token provided. Unable to validate` });
    });
};

export const refreshToken = (req: Request, res: Response) => {
  const DB: any = db;
  const { token, user, organization } = DB;

  const refreshToken = req.body["refreshToken"];
  if (refreshToken == null) {
    return res.status(401).json({
      error: "Required parameter `refreshToken` not provided or null",
    });
  }

  token
    .findOne({
      attributes: ["token", "userId", "expiry", "user->organization.org_hero"],
      where: { token: refreshToken, expiry: { [Op.gte]: sequelize.fn("NOW") } },
      include: [
        {
          model: user,
          where: {
            status: userStatus.active,
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
          required: true,
        },
      ],
    })
    .then((data: typeof token) => {
      if (data) {
        generateTokenPair(data.userId)
          .then((tokenResponse: any) => {
            // Add orgHero in token refresh response
            tokenResponse["orgHero"] = data.user.organization.orgHero;
            tokenResponse["role"] = data.user.role;
            res.json(tokenResponse);
          })
          .catch((err: any) => {
            return res
              .status(401)
              .json({ error: "Error in Generating Tokens" });
          });
      } else {
        return res.status(401).json({ error: "Invalid/Expired Refresh Token" });
      }
    })
    .catch(() => {
      return res.status(500).json({ error: "Unknown Error in Token Refresh" });
    });
};

export const resetPasswordRequest = (req: Request, res: Response) => {
  const DB: any = db;
  const { otp, user, organization } = DB;

  const email = req.body["email"];

  if (email == null) {
    return res
      .status(401)
      .json({ error: "Required parameter `email` not provided or null" });
  }

  user
    .findOne({
      attributes: ["id", "email", "orgId", "organization.auth"],
      where: {
        email: email,
        status: userStatus.active,
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
    .then((data: any) => {
      if (data != null) {
        //console.log(data.id);
        let token = uuidv4();
        otp
          .create({
            operation: "reset-password",
            token: token,
            userId: data.id,
            expiry: sequelize.literal("NOW() + INTERVAL '1D'"),
            used: false,
            createdAt: sequelize.fn("NOW"),
          })
          .then((otp_data: typeof otp) => {
            sendMail({
              to: email,
              template: "password-reset-email",
              dynVars: {
                token: otp_data.token,
                userId: data.id,
              },
            });
          })
          .catch((e: any) => {
            console.log("Error in creating OTP: ", e);
            throw Error("Error in creating OTP");
          });
      }
      return res.status(200).json({
        message: "If user is active, password reset email has been sent!",
      });
    })
    .catch(() => {
      return res.status(500).json({ error: "Unknown Error in Reset Password" });
    });
};

export const resetPassword = (req: Request, res: Response) => {
  const DB: any = db;
  const { otp, user } = DB;

  const token = req.body["token"];
  const userId = req.body["userId"];
  const password = req.body["password"];

  if (userId == null) {
    return res
      .status(401)
      .json({ error: "Required parameter `userId` not provided or null" });
  }

  if (token == null) {
    return res
      .status(401)
      .json({ error: "Required parameter `token` not provided or null" });
  }

  if (password == null || password.length < 6) {
    return res.status(401).json({
      error: `Required field \`password\` must have length >= ${MIN_PASSWORD_LENGTH} characters`,
    });
  }

  otp
    .update(
      { used: true },
      {
        where: {
          userId: userId,
          token: token,
          operation: "reset-password",
          used: false,
          expiry: {
            [Op.gte]: sequelize.fn("NOW"),
          },
        },
      }
    )
    .then((data: any) => {
      if (data[0] == 1) {
        // TODO: Make this async
        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(password, salt);
        user
          .update({ password: hashedPass }, { where: { id: userId } })
          .then(() => {
            return res.status(200).json({
              message: "Password reset success!",
            });
          })
          .catch(() => {
            return res
              .status(500)
              .json({ error: "Unknown Error while resetting password" });
          });
      } else {
        return res.status(400).json({
          error: "Invalid or expired token provided",
        });
      }
    })
    .catch(() => {
      return res
        .status(500)
        .json({ error: "Unknown Error in Resetting Password" });
    });
};
