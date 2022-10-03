"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define associations here
      this.hasMany(models.token);
      this.belongsTo(models.organization, {
        foreignKey: {
          name: "orgId",
        },
      });
    }
  }
  user.init(
    {
      orgId: DataTypes.UUID,
      email: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "user",
      updatedAt: "created_at",
      createdAt: "updated_at",
      underscored: true,
    }
  );
  return user;
};
