"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  otp.init(
    {
      operation: DataTypes.STRING,
      token: { type: DataTypes.STRING, primaryKey: true },
      expiry: DataTypes.DATE,
      used: DataTypes.BOOLEAN,
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
    },
    {
      sequelize,
      modelName: "otp",
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return otp;
};
