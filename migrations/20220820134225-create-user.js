"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      orgId: {
        allowNull: false,
        type: Sequelize.UUID,
        field: "org_id",
        unique: "compositeIndex",
        references: {
          model: "organizations",
          key: "id",
        },
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: "compositeIndex",
      },
      firstName: {
        type: Sequelize.STRING,
        field: "first_name",
      },
      lastName: {
        type: Sequelize.STRING,
        field: "last_name",
      },
      password: {
        type: Sequelize.STRING,
      },
      role: {
        allowNull: false,
        type: Sequelize.ENUM("global_admin", "admin", "user"),
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
