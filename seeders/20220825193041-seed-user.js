"use strict";
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const rootEmail = process.env.ROOT_EMAIL || "root@slashgo.link";
const rootPassword = process.env.ROOT_PASSWORD || "admin";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: "13370000-0000-0000-0000-000000000000",
          org_id: "00000000-0000-0000-0000-000000001337",
          email: rootEmail,
          first_name: "CHANGE",
          last_name: "ME",
          password: await bcrypt.hash(rootPassword, saltRounds),
          status: "active",
          role: "global_admin",
          created_at: sequelize.fn("NOW"),
          updated_at: sequelize.fn("NOW"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
