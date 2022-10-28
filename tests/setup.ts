import db from "../models";
import { DEFAULT_ORG_HERO, userStatus } from "../utils/defaults";

module.exports = async function (
  globalConfig: { testPathPattern: any },
  projectConfig: { cache: any }
) {
  console.log("Adding Orgs for Tests");
  const DB: any = db;
  const { organization, user, link } = DB;

  await organization.create({
    id: "10000000-0001-3370-0000-000000000001",
    name: "Org1",
    licenses: 5,
    active: true,
    orgHero: DEFAULT_ORG_HERO,
  });

  await organization.create({
    id: "10000000-0001-3370-0000-000000000002",
    name: "Org2",
    licenses: 10,
    active: true,
    orgHero: DEFAULT_ORG_HERO,
  });

  // Adding Test Users
  // Org1 Admin
  await user.create({
    id: "00000000-0001-3370-0000-000000000011",
    orgId: "10000000-0001-3370-0000-000000000001",
    email: "admin@org1.com",
    firstName: "Admin",
    role: "admin",
    lastName: "Org1",
    password: "HASHED_PASSWORD",
    status: userStatus.active,
  });

  // Org1 User1
  await user.create({
    id: "00000000-0001-3370-0000-000000000021",
    orgId: "10000000-0001-3370-0000-000000000001",
    email: "user1@org1.com",
    firstName: "User1",
    role: "user",
    lastName: "Org1",
    password: "HASHED_PASSWORD",
    status: userStatus.active,
  });

  // Org1 User2
  await user.create({
    id: "00000000-0001-3370-0000-000000000031",
    orgId: "10000000-0001-3370-0000-000000000001",
    email: "user2@org1.com",
    firstName: "User2",
    role: "user",
    lastName: "Org1",
    password: "HASHED_PASSWORD",
    status: userStatus.active,
  });

  // Org2 Admin
  await user.create({
    id: "00000000-0001-3370-0000-000000000041",
    orgId: "10000000-0001-3370-0000-000000000002",
    email: "admin@org2.com",
    firstName: "Admin",
    role: "admin",
    lastName: "Org2",
    password: "HASHED_PASSWORD",
    status: userStatus.active,
  });

  // Org2 User1
  await user.create({
    id: "00000000-0001-3370-0000-000000000051",
    orgId: "10000000-0001-3370-0000-000000000001",
    email: "user1@org2.com",
    firstName: "User1",
    role: "user",
    lastName: "Org2",
    password: "HASHED_PASSWORD",
    status: userStatus.active,
  });

  await link.create({
    id: "91000000-0001-3370-a000-000000000001",
    orgId: "10000000-0001-3370-0000-000000000001",
    shortLink: "publico1admin",
    fullUrl: "https://o1admin.com",
    description: "Public Link created by Org1 Admin",
    private: false,
    type: "static",
    createdBy: "00000000-0001-3370-0000-000000000011",
    active: true,
  });

  await link.create({
    id: "92000000-0001-3370-a000-000000000001",
    orgId: "10000000-0001-3370-0000-000000000001",
    shortLink: "privateo1admin",
    fullUrl: "https://2.o1admin.com",
    description: "Private Link created by Org1 Admin ",
    private: true,
    type: "static",
    createdBy: "00000000-0001-3370-0000-000000000011",
    active: true,
  });

  await link.create({
    id: "93000000-0001-3370-a000-000000000001",
    orgId: "10000000-0001-3370-0000-000000000001",
    shortLink: "privateo1u1",
    fullUrl: "https://o1user1.com",
    description: "Private Link created by Org1 User1",
    private: true,
    type: "static",
    createdBy: "00000000-0001-3370-0000-000000000021",
    active: true,
  });
};
