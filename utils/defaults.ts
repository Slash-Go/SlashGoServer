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

export const emailRegex = /^\S+@\S+\.\S+$/;
export const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
