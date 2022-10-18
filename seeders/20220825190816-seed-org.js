"use strict";
var sequelize = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "organizations",
      [
        {
          id: "10000000-0001-3370-0000-000000000000",
          name: "Default SlashGo Organization",
          licenses: 100,
          active: true,
          org_hero: "go",
          auth: "password",
          plan_type: "self-hosted",
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
