import request from "supertest";
import { Request, Response, NextFunction } from "express";
import { app } from "../index";
import { Auth } from "../middleware/authMiddleware";

jest.mock('../middleware/authMiddleware', () => {
  const originalModule = jest.requireActual('../middleware/authMiddleware');
  return new Proxy(originalModule, {
    get: (target, property) => {
      switch (property) {
        case 'authenticate': {
          return jest.fn((
            req: Request,
            _: Response,
            next: NextFunction
          ) => { 
            if (req.headers.authorization === "Bearer GLOBAL_ADMIN_TOKEN") {
              req.auth = new Auth({
                  userRole: "global_admin",
                  userId: "00000000-0001-3370-0000-000000000001",
                  orgId: "10000000-0001-3370-0000-000000000000",
                });
            } else if (req.headers.authorization === "Bearer ORG1_ADMIN_TOKEN") {
              req.auth = new Auth({
                  userRole: "admin",
                  userId: "00000000-0001-3370-0000-000000000011",
                  orgId: "10000000-0001-3370-0000-000000000001",
                });
            } else if (req.headers.authorization === "Bearer ORG2_ADMIN_TOKEN") {
              req.auth = new Auth({
                  userRole: "admin",
                  userId: "00000000-0001-3370-0000-000000000041",
                  orgId: "10000000-0001-3370-0000-000000000002",
                });
            } else if (req.headers.authorization === "Bearer ORG1_USER1_TOKEN") {
              req.auth = new Auth({
                  userRole: "user",
                  userId: "00000000-0001-3370-0000-000000000021",
                  orgId: "10000000-0001-3370-0000-000000000001",
                });
            } else if (req.headers.authorization === "Bearer ORG1_USER2_TOKEN") {
              req.auth = new Auth({
                  userRole: "user",
                  userId: "00000000-0001-3370-0000-000000000031",
                  orgId: "10000000-0001-3370-0000-000000000001",
                });
            } else if (req.headers.authorization === "Bearer ORG2_USER1_TOKEN") {
              req.auth = new Auth({
                  userRole: "user",
                  userId: "00000000-0001-3370-0000-000000000051",
                  orgId: "10000000-0001-3370-0000-000000000002",
                });
            }
            next();
        })
      }
        default: {
          return target[property]
        }
      }
    },
  })
});

describe("GET /link", () => {
  it("should return 200 OK and one link of global org for Global Admin", async () => {
    const res = await request(app).get("/link").set('Authorization', 'Bearer GLOBAL_ADMIN_TOKEN');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].shortLink).toBe("code");
  });

});

export {};