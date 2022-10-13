"use strict";
const sequelize = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "links",
      [
        {
          id: "00000000-1337-0000-0000-000000000000",
          org_id: "00000000-0000-0000-0000-000000001337",
          short_link: "code",
          full_url: "https://github.com/Slash-Go",
          description: "Github Repo for Slash/Go 🎉",
          created_by: "13370000-0000-0000-0000-000000000000",
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
