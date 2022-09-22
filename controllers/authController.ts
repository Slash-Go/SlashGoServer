import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db, { sequelize } from "../models";
import { generateTokenPair } from "../middleware/authMiddleware";
import { Op } from "sequelize";

export const login = (req: Request, res: Response) => {
  const DB: any = db;
  const { user } = DB;

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
      attributes: ["id", "email", "password", "orgId"],
      where: {
        email: email,
        active: true,
      },
    })
    .then((data: typeof user) => {
      if (data === null) {
        return res
        .status(401)
        .json({ error: "User not found!" });
      }
      
      bcrypt.compare(password, data.password, function (err, result) {
        if (result) {
          generateTokenPair(data.id)
            .then((tokenPair: any) => {
              return res.json(tokenPair);
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
  const { token } = DB;

  // TODO: API Validations
  // Only allow access to users in own org

  const refreshToken = req.body["refreshToken"];
  token
    .findOne({
      attributes: ["token", "userId", "expiry"],
      where: { token: refreshToken, expiry: { [Op.gte]: sequelize.fn("NOW") } },
    })
    .then((data: typeof token) => {
      if (data) {
        generateTokenPair(data.userId)
          .then((tokenPair: any) => {
            return res.json(tokenPair);
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
