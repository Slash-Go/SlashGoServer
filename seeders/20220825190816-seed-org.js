"use strict";
var sequelize = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "organizations",
      [
        {
          id: "00000000-0000-0000-0000-000000001337",
          name: "Default Organization",
          licenses: 1,
          active: true,
          created_at: sequelize.fn("NOW"),
          updated_at: sequelize.fn("NOW"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("organizations", null, {});
  },
};
