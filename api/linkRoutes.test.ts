import request from "supertest";
import { Request, Response, NextFunction } from "express";
import { app } from "../index";
import { Auth } from "../middleware/authMiddleware";

jest.mock("../middleware/authMiddleware", () => {
  const originalModule = jest.requireActual("../middleware/authMiddleware");
  return new Proxy(originalModule, {
    get: (target, property) => {
      switch (property) {
        case "authenticate": {
          return jest.fn((req: Request, _: Response, next: NextFunction) => {
            if (req.headers.authorization === "Bearer GLOBAL_ADMIN_TOKEN") {
              req.auth = new Auth({
                userRole: "global_admin",
                userId: "00000000-0001-3370-0000-000000000001",
                orgId: "10000000-0001-3370-0000-000000000000",
              });
            } else if (
              req.headers.authorization === "Bearer ORG1_ADMIN_TOKEN"
            ) {
              req.auth = new Auth({
                userRole: "admin",
                userId: "00000000-0001-3370-0000-000000000011",
                orgId: "10000000-0001-3370-0000-000000000001",
              });
            } else if (
              req.headers.authorization === "Bearer ORG2_ADMIN_TOKEN"
            ) {
              req.auth = new Auth({
                userRole: "admin",
                userId: "00000000-0001-3370-0000-000000000041",
                orgId: "10000000-0001-3370-0000-000000000002",
              });
            } else if (
              req.headers.authorization === "Bearer ORG1_USER1_TOKEN"
            ) {
              req.auth = new Auth({
                userRole: "user",
                userId: "00000000-0001-3370-0000-000000000021",
                orgId: "10000000-0001-3370-0000-000000000001",
              });
            } else if (
              req.headers.authorization === "Bearer ORG1_USER2_TOKEN"
            ) {
              req.auth = new Auth({
                userRole: "user",
                userId: "00000000-0001-3370-0000-000000000031",
                orgId: "10000000-0001-3370-0000-000000000001",
              });
            } else if (
              req.headers.authorization === "Bearer ORG2_USER1_TOKEN"
            ) {
              req.auth = new Auth({
                userRole: "user",
                userId: "00000000-0001-3370-0000-000000000051",
                orgId: "10000000-0001-3370-0000-000000000002",
              });
            } else if (
              req.headers.authorization === "Bearer NODATAORG_ADMIN_TOKEN"
            ) {
              req.auth = new Auth({
                userRole: "admin",
                userId: "00000000-0001-3370-0000-000000000061",
                orgId: "10000000-0001-3370-0000-000000000003",
              });
            }
            next();
          });
        }
        default: {
          return target[property];
        }
      }
    },
  });
});

describe("GET all links", () => {
  it("should return 200 OK and one link of global org for Global Admin", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].shortLink).toBe("code");
  });

  it("should return 200 OK and 2 links of org1 for Org1 Admin", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(5);
    expect(res.body[0].shortLink).toBe("2publico1u1");
    expect(res.body[1].shortLink).toBe("3publico1u1");
    expect(res.body[2].shortLink).toBe("privateo1admin");
    expect(res.body[3].shortLink).toBe("publico1admin");
    expect(res.body[4].shortLink).toBe("publico1u1");
  });

  it("should return 200 OK and 5 link of org1 for Org1 User1", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(5);
    expect(res.body[0].shortLink).toBe("2publico1u1");
    expect(res.body[1].shortLink).toBe("3publico1u1");
    expect(res.body[2].shortLink).toBe("privateo1u1");
    expect(res.body[3].shortLink).toBe("publico1admin");
    expect(res.body[4].shortLink).toBe("publico1u1");
  });

  it("should return 200 OK and no data of admin of nodataorg", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer NODATAORG_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it("should return 200 OK and 1 link of org1 for Org1 User2", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(4);
    expect(res.body[0].shortLink).toBe("2publico1u1");
    expect(res.body[1].shortLink).toBe("3publico1u1");
    expect(res.body[2].shortLink).toBe("publico1admin");
    expect(res.body[3].shortLink).toBe("publico1u1");
  });

  it("should return 200 OK and no links of org2 for Org2 Admin", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it("should return 200 OK and no links of org2 for Org2 user1", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe("GET private link", () => {
  it("should return Not Found for Global Admin in her org", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return Not Found for Global Admin when they pass org value", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .send({ orgId: "10000000-0001-3370-0000-000000000001" })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return Not Found and org Admin of same org", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return Not Found and org admin of different org", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return Not Found and org user of different org", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return Not Found and other user in same org", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return 200 OK for Org1 User1", async () => {
    const res = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("privateo1u1");
  });
});

describe("GET public link", () => {
  it("should return 400 if a non-UUID is sent", async () => {
    const res = await request(app)
      .get("/link/random-string")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value provided for `linkId`");
  });

  it("should return Not Found for Global Admin in her org", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return 200 OK for Global Admin when they pass org value", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .send({ orgId: "10000000-0001-3370-0000-000000000001" })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("publico1admin");
  });

  it("should return 200 OK and org Admin of same org", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("publico1admin");
  });

  it("should return Not Found and org admin of different org", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return Not Found and org user of different org", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return 200 OK user in same org", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("publico1admin");
  });

  it("should return 200 OK for Org1 User1", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("publico1admin");
  });
});

describe("Create public link", () => {
  it("Create Link API Validations", async () => {
    const res = await request(app)
      .post("/link")
      .send({ shortLink: "pubtest" })
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Required field `fullUrl` not provided or null"
    );

    const res2 = await request(app)
      .post("/link")
      .send({ fullUrl: "https://pubtest.com" })
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res2.statusCode).toBe(400);
    expect(res2.body.error).toBe(
      "Required field `shortLink` not provided or null"
    );

    const res3 = await request(app)
      .post("/link")
      .send({ fullUrl: "https://pubtest.com", shortLink: "pubtest" })
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res3.statusCode).toBe(400);
    expect(res3.body.error).toBe("Required field `type` not provided or null");

    const res4 = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "pubtest",
        type: "static",
      })
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res4.statusCode).toBe(400);
    expect(res4.body.error).toBe(
      "Required field `private` not provided or null"
    );

    const res5 = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "pubtest",
        private: false,
        type: "",
      })
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res5.statusCode).toBe(400);
    expect(res5.body.error).toBe("`type` can only be `static` or `dynamic`");
  });

  it("Create Public link in Global Admin Org", async () => {
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "gapubtest",
        private: false,
        type: "static",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("gapubtest");
    const linkId = res.body.id;

    //Ensure only Global Admin User has access to this link
    const res2 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res2.statusCode).toBe(200);

    const res3 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res3.statusCode).toBe(404);

    const res4 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res4.statusCode).toBe(404);

    const res5 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res5.statusCode).toBe(404);
  });

  it("Global Admin Create Public link in Another Org", async () => {
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "gapubtest",
        private: false,
        type: "static",
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.shortLink).toBe("gapubtest");
    const linkId = res.body.id;

    //Ensure only Org1 Users have access to this link
    const res2 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res2.statusCode).toBe(404);

    const res3 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res3.statusCode).toBe(200);

    const res4 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res4.statusCode).toBe(200);

    const res5 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res5.statusCode).toBe(404);
  });

  it("Create Public link in Another Org As Non-Global Admin", async () => {
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "gapubtest2",
        private: false,
        type: "static",
        orgId: "10000000-0001-3370-0000-000000000002",
      })
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    // Ensure orgId is Org1 Id, not Org2 Id
    expect(res.body.orgId).toBe("10000000-0001-3370-0000-000000000001");
    const linkId = res.body.id;

    //Ensure only Org1 Users have access to this link
    const res3 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res3.statusCode).toBe(200);

    const res4 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res4.statusCode).toBe(200);

    const res5 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res5.statusCode).toBe(404);
  });

  it("Allow Duplicate Public Shortlink in DIFFERENT ORG", async () => {
    // Creating a duplicate shortlink in same org should give Error
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "gapubtest2",
        private: false,
        type: "static",
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "This shortlink is already defined for your org"
    );

    const res2 = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://pubtest.com",
        shortLink: "gapubtest2",
        private: false,
        type: "static",
      })
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");

    expect(res2.statusCode).toBe(200);
    const linkId = res2.body.id;

    //Ensure only Org1 User1 have access to this link
    const res3 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res3.statusCode).toBe(404);

    const res4 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res4.statusCode).toBe(200);

    const res5 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res5.statusCode).toBe(200);
  });
});

describe("Create private link", () => {
  it("Global Admin Create Private link in Another Org", async () => {
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://privtest.com",
        shortLink: "admpritest",
        private: true,
        type: "static",
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "`global_admin` can only create private links in their own orgs"
    );
  });

  it("Create Private link in Org As Non-Global Admin", async () => {
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://privtest.com",
        shortLink: "admpritest",
        private: true,
        type: "static",
      })
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");

    expect(res.statusCode).toBe(200);
    // Ensure orgId is Org1 Id, not Org2 Id
    expect(res.body.orgId).toBe("10000000-0001-3370-0000-000000000001");
    const linkId = res.body.id;

    //Ensure only Org1 Users have access to this link
    const res3 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res3.statusCode).toBe(200);

    const res4 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res4.statusCode).toBe(404);

    const res5 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG2_USER1_TOKEN");
    expect(res5.statusCode).toBe(404);
  });

  it("Allow Duplicate Private Shortlink in Same Org BY DIFFERENT USER", async () => {
    const res = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://privtest.com",
        shortLink: "admpritest",
        private: true,
        type: "static",
      })
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("This private shortlink is already defined");

    const res2 = await request(app)
      .post("/link")
      .send({
        fullUrl: "https://privtest.com",
        shortLink: "admpritest",
        private: true,
        type: "static",
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");

    expect(res2.statusCode).toBe(200);
    const linkId = res2.body.id;

    //Ensure only Org1 User1 have access to this link
    const res3 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res3.statusCode).toBe(404);

    const res4 = await request(app)
      .get(`/link/${linkId}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res4.statusCode).toBe(200);
  });
});

describe("Edit public link", () => {
  it("should return 400 if a non-UUID is sent", async () => {
    const res = await request(app)
      .patch("/link/random-string")
      .send({
        shortLink: "updlink",
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value provided for `linkId`");
  });

  it("Global Admin edits public link in Another Org", async () => {
    const res = await request(app)
      .patch("/link/91000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updlink",
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updlink");
  });

  it("Org Admin edits public link in Another Org", async () => {
    const res = await request(app)
      .patch("/link/91000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updlink2",
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Invalid fields provided for update operation `orgId`"
    );

    const res2 = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updlink");
  });

  it("User edits public link in Same Org Created by different user", async () => {
    const res = await request(app)
      .patch("/link/91000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updlink2",
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Unable to update link. Ensure you the creator of this shortlink or an admin"
    );

    const res2 = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updlink");
  });

  it("User edits public link in Same Org created by her", async () => {
    const res = await request(app)
      .patch("/link/94000000-0001-3370-a000-000000000001")
      .send({
        active: false,
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/94000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.active).toBe(false);
  });

  it("Org Admin edits public link in Same Org created by different user", async () => {
    const res = await request(app)
      .patch("/link/94000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updlink2",
      })
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/94000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updlink2");
  });
});

describe("Edit private link", () => {
  it("Global Admin edits public link in Another Org", async () => {
    const res = await request(app)
      .patch("/link/93000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updprivlink",
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updprivlink");
  });

  it("Org Admin edits private link in Another Org", async () => {
    const res = await request(app)
      .patch("/link/93000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updlink2",
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Invalid fields provided for update operation `orgId`"
    );

    const res2 = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updprivlink");
  });

  it("User edits private link in Same Org Created by different user", async () => {
    const res = await request(app)
      .patch("/link/93000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updlink2",
      })
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Unable to update link. Ensure you the creator of this shortlink or an admin"
    );

    const res2 = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updprivlink");
  });

  it("User edits private link in Same Org created by her", async () => {
    const res = await request(app)
      .patch("/link/93000000-0001-3370-a000-000000000001")
      .send({
        active: false,
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.active).toBe(false);
  });

  it("Org Admin edits private link in Same Org created by different user", async () => {
    const res = await request(app)
      .patch("/link/93000000-0001-3370-a000-000000000001")
      .send({
        shortLink: "updprivlink2",
      })
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/93000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updprivlink2");
  });
});

describe("Delete public link", () => {
  it("should return 400 if a non-UUID is sent", async () => {
    const res = await request(app)
      .delete("/link/random-string")
      .send({
        shortLink: "updlink",
      })
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value provided for `linkId`");
  });

  it("Org Admin deletes public link in Another Org", async () => {
    const res = await request(app)
      .delete("/link/94000000-0001-3370-a000-000000000001")
      .send({
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Unable to delete shortlink. Ensure you have access to delete this shortlink"
    );

    const res2 = await request(app)
      .get("/link/94000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
  });

  it("User deletes public link in Same Org Created by different user", async () => {
    const res = await request(app)
      .delete("/link/94000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Unable to delete shortlink. Ensure you have access to delete this shortlink"
    );

    const res2 = await request(app)
      .get("/link/94000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
    expect(res2.body.shortLink).toBe("updlink2");
  });

  it("Global Admin deletes public link in Another Org", async () => {
    const res = await request(app)
      .delete("/link/94000000-0001-3370-a000-000000000001")
      .send({
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");

    const res2 = await request(app)
      .get("/link/94000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(404);
  });

  it("User deletes public link in Same Org created by her", async () => {
    const res = await request(app)
      .delete("/link/95000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/95000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(404);
  });

  it("Org Admin deletes public link in Same Org created by different user", async () => {
    const res = await request(app)
      .get("/link/96000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);

    const res1 = await request(app)
      .delete("/link/96000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res1.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/link/96000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(404);
  });
});

describe("Delete private link", () => {
  let createdLinks: string[] = [];

  // Create Dummy Private Links for Org 1 User 1
  beforeAll(async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post("/link")
        .send({
          fullUrl: "https://privtest.com",
          shortLink: `delprivtest${i}`,
          private: true,
          type: "static",
        })
        .set("Authorization", "Bearer ORG1_USER1_TOKEN");

      createdLinks.push(res.body.id);
    }
  });

  it("Global Admin deleted private link in Another Org", async () => {
    const res = await request(app)
      .delete(`/link/${createdLinks[0]}`)
      .send({
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get(`/link/${createdLinks[0]}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(404);
  });

  it("Org Admin deletes private link in Another Org", async () => {
    const res = await request(app)
      .delete(`/link/${createdLinks[1]}`)
      .send({
        orgId: "10000000-0001-3370-0000-000000000001",
      })
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Unable to delete shortlink. Ensure you have access to delete this shortlink"
    );

    const res2 = await request(app)
      .get(`/link/${createdLinks[1]}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
  });

  it("User deletes private link in Same Org Created by different user", async () => {
    const res = await request(app)
      .delete(`/link/${createdLinks[1]}`)
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Unable to delete shortlink. Ensure you have access to delete this shortlink"
    );

    const res2 = await request(app)
      .get(`/link/${createdLinks[1]}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(200);
  });

  it("User deletes private link in Same Org created by her", async () => {
    const res = await request(app)
      .delete(`/link/${createdLinks[1]}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get(`/link/${createdLinks[1]}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(404);
  });

  it("Org Admin edits private link in Same Org created by different user", async () => {
    const res = await request(app)
      .delete(`/link/${createdLinks[2]}`)
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);

    const res2 = await request(app)
      .get(`/link/${createdLinks[2]}`)
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res2.statusCode).toBe(404);
  });
});

export {};
