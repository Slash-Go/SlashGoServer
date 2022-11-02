"use strict";
const sequelize = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "links",
      [
        {
          id: "10000000-0001-3370-0000-000000000001",
          org_id: "10000000-0001-3370-0000-000000000000",
          short_link: "code",
          full_url: "https://github.com/Slash-Go",
          description: "Github Repo for Slash/Go 🎉",
          created_by: "00000000-0001-3370-a000-000000000001",
          type: "static",
          private: false,
          active: true,
          created_at: sequelize.fn("NOW"),
          updated_at: sequelize.fn("NOW"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("links", null, {});
  },
};
