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

describe("GET /link", () => {
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
    expect(res.body.length).toBe(2);
    expect(res.body[0].shortLink).toBe("privateo1admin");
    expect(res.body[1].shortLink).toBe("publico1admin");
  });

  it("should return 200 OK and 1 link of org1 for Org1 User1", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].shortLink).toBe("privateo1u1");
    expect(res.body[1].shortLink).toBe("publico1admin");
  });

  it("should return 200 OK and 1 link of org1 for Org1 User2", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].shortLink).toBe("publico1admin");
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

describe("GET /link", () => {
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
    expect(res.body.length).toBe(2);
    expect(res.body[0].shortLink).toBe("privateo1admin");
    expect(res.body[1].shortLink).toBe("publico1admin");
  });

  it("should return 200 OK and 1 link of org1 for Org1 User1", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].shortLink).toBe("privateo1u1");
    expect(res.body[1].shortLink).toBe("publico1admin");
  });

  it("should return 200 OK and 1 link of org1 for Org1 User2", async () => {
    const res = await request(app)
      .get("/link")
      .set("Authorization", "Bearer ORG1_USER2_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].shortLink).toBe("publico1admin");
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
      .send({orgId: "10000000-0001-3370-0000-000000000001"})
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
  it("should return Not Found for Global Admin in her org", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);
  });

  it("should return 200 OK for Global Admin when they pass org value", async () => {
    const res = await request(app)
      .get("/link/91000000-0001-3370-a000-000000000001")
      .send({orgId: "10000000-0001-3370-0000-000000000001"})
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

export {};
