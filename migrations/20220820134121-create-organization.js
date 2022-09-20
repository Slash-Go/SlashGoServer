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
          unique: true
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
      },
      { underscored: true }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("organizations");
  },
};
