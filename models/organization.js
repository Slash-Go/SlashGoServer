"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class organization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.user, {
        foreignKey: {
          name: "orgId",
        },
      });
    }
  }
  organization.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      licenses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      auth: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "password",
      },
      planType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "self-hosted",
      },
      planExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      orgHero: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "go",
      },
    },
    {
      sequelize,
      modelName: "organization",
      updatedAt: "updated_at",
      createdAt: "created_at",
      underscored: true,
    }
  );
  return organization;
};
