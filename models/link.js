"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class link extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  link.init(
    {
      orgId: DataTypes.STRING,
      shortLink: DataTypes.STRING,
      fullUrl: DataTypes.STRING,
      description: DataTypes.STRING,
      createdBy: DataTypes.STRING,
      type: DataTypes.STRING,
      private: DataTypes.BOOLEAN,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "link",
      updatedAt: "created_at",
      createdAt: "updated_at",
      underscored: true,
    }
  );
  return link;
};
