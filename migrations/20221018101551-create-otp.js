"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("otps", {
      operation: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true,
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        field: "user_id",
      },
      expiry: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      used: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        default: false,
      },
      createdAt: {
        allowNull: false,
        field: "created_at",
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("otps");
  },
};
