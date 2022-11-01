"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable("links", {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          default: Sequelize.UUIDV4,
        },
        orgId: {
          allowNull: false,
          type: Sequelize.UUID,
          field: "org_id",
          references: {
            model: "organizations",
            key: "id",
          },
        },
        shortLink: {
          allowNull: false,
          type: Sequelize.STRING,
          field: "short_link",
        },
        fullUrl: {
          allowNull: false,
          type: Sequelize.TEXT,
          field: "full_url",
        },
        description: {
          allowNull: true,
          type: Sequelize.TEXT,
        },
        createdBy: {
          allowNull: false,
          type: Sequelize.UUID,
          field: "created_by",
          references: {
            model: "users",
            key: "id",
          },
        },
        type: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        private: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        active: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        createdAt: {
          allowNull: false,
          field: "created_at",
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          field: "updated_at",
          type: Sequelize.DATE,
        },
      })
      .then(() => {
        queryInterface.addIndex(
          "links",
          ["org_id", "short_link", "created_by", "private"],
          { unique: true, name: "org_private_shortlink_index" }
        );
        queryInterface.addIndex("links", ["org_id", "short_link"], {
          unique: true,
          name: "org_public_shortlink_index",
          where: {
            private: false,
          },
        });
      });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("links");
  },
};
