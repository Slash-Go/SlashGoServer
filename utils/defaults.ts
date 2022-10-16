const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

export const MIN_PASSWORD_LENGTH: number = 6;

export const getStaticTemplateVars = () => {
  return {
    baseUrl: config.general.baseUrl,
  };
};
