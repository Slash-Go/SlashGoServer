"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "organizations",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
          unique: true,
        },
        licenses: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        active: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: "created_at",
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: "updated_at",
        },
        auth: {
          allowNull: false,
          type: Sequelize.STRING,
          defaultValue: "password",
        },
        planType: {
          allowNull: false,
          type: Sequelize.STRING,
          field: "plan_type",
          defaultValue: "self-hosted",
        },
        planExpiry: {
          allowNull: true,
          type: Sequelize.DATE,
          field: "plan_expiry",
        },
        settings: {
          allowNull: true,
          type: Sequelize.JSON,
          defaultValue: {},
        },
        orgHero: {
          allowNull: false,
          type: Sequelize.STRING,
          field: "org_hero",
          defaultValue: "go",
        },
      },
      { underscored: true }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("organizations");
  },
};
