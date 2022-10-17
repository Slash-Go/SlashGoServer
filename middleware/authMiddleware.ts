import { Request, Response, NextFunction } from "express";
import db, { sequelize } from "../models";
import Sequelize, { Op } from "sequelize";
import crypto from "crypto";
import { userRoles } from "../utils/defaults";

const BEARER = "Bearer ";

declare global {
  namespace Express {
    interface Request {
      auth: Auth;
    }
  }
}

interface AuthInterface {
  userId: string;
  orgId: string;
  userRole: string;
}

export class Auth {
  public userId: string;
  public orgId: string;
  public userRole: string;

  constructor({ userId, orgId, userRole }: AuthInterface) {
    this.userId = userId;
    this.orgId = orgId;
    this.userRole = userRole;
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith(BEARER)) {
    return res
      .status(401)
      .json({ status: "Authorization Bearer Token not provided" });
  }

  let token: string = authorizationHeader.substring(BEARER.length);
  await verifyToken(token)
    .then((response: any) => {
      if (response.success) {
        req.auth = new Auth({
          userId: response.userId,
          orgId: response.orgId,
          userRole: response.userRole,
        });
        next();
      } else {
        return res
          .status(401)
          .json({ status: "Unable to authenticate access token" });
      }
    })
    .catch(() => {
      return res
        .status(401)
        .json({ status: "Unable to authenticate access token with error" });
    });
};

const verifyToken = (apiToken: string) => {
  const DB: any = db;
  const { token, user } = DB;
  return token
    .findOne({
      attributes: ["token", "userId", "expiry"],
      include: [user],
      where: { token: apiToken, expiry: { [Op.gte]: sequelize.fn("NOW") } },
    })
    .then((data: typeof token) => {
      if (data) {
        return {
          success: true,
          userRole: data.user.role,
          userId: data.userId,
          orgId: data.user.orgId,
        };
      } else {
        return { success: false, status: "NOT_FOUND" };
      }
    })
    .catch(() => {
      return { success: false, status: "ERROR" };
    });
};

export const generateTokenPair = (userId: string) => {
  const DB: any = db;
  const { token } = DB;
  const accessToken = randomString();
  const refreshToken = randomString();
  const data = [
    {
      token: accessToken,
      userId: userId,
      type: 0,
      expiry: Sequelize.literal("NOW() + (INTERVAL '60 MINUTE')"),
    },
    {
      token: refreshToken,
      userId: userId,
      type: 1,
      expiry: Sequelize.literal("NOW() + (INTERVAL '60 DAY')"),
    },
  ];
  return token
    .bulkCreate(data, { returning: true })
    .then(() => {
      return { accessToken: accessToken, refreshToken: refreshToken };
    })
    .catch((err: any) => {
      return { accessToken: "NONE", refreshToken: "NONE" };
    });
};

const randomString = (size: number = 20) => {
  return crypto.randomBytes(size).toString("hex").slice(0, size);
};

export const adminsOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.auth.userRole === userRoles.admin ||
    req.auth.userRole === userRoles.global_admin
  ) {
    next();
  } else {
    return res
      .status(403)
      .json({ status: "Your user role does not permit this action" });
  }
};

export const globalAdminsOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.auth.userRole === userRoles.global_admin) {
    next();
  } else {
    return res
      .status(403)
      .json({ status: "Your user role does not permit this action" });
  }
};
