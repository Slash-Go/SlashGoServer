"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: "userId" });
      // define association here
    }
  }
  token.init(
    {
      token: { type: DataTypes.STRING, primaryKey: true },
      type: DataTypes.INTEGER,
      userId: DataTypes.UUID,
      expiry: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "token",
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    }
  );
  return token;
};
