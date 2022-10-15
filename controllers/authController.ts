import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db, { sequelize } from "../models";
import { generateTokenPair } from "../middleware/authMiddleware";
import { Op } from "sequelize";

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
        active: true,
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
        return res.status(401).json({ error: "User not found!" });
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
            active: true,
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
      return res.status(401).json({ error: "Unknown Error in Token Refresh" });
    });
};
