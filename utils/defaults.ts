const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

export const MIN_PASSWORD_LENGTH: number = 6;

export const enum userStatus {
  invited = "invited",
  active = "active",
  deactivated = "deactivated",
  locked = "locked",
}

export const getStaticTemplateVars = () => {
  return {
    baseUrl: config.general.baseUrl,
  };
};
