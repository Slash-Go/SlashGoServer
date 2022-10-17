const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

export const DEFAULT_ORG_HERO = "go";
export const MIN_PASSWORD_LENGTH: number = 6;

export enum userStatus {
  invited = "invited",
  active = "active",
  deactivated = "deactivated",
  locked = "locked",
}

export enum userRoles {
  user = "user",
  admin = "admin",
  global_admin = "global_admin",
}

export enum linkTypes {
  static = "static",
  dynamic = "dynamic",
}

export const getStaticTemplateVars = () => {
  return {
    baseUrl: config.general.baseUrl,
  };
};
