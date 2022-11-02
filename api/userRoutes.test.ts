import request from "supertest";
import { app } from "../index";

describe("GET all users", () => {
  it("should return 200 OK and one user of global org for Global Admin", async () => {
    const res = await request(app)
      .get("/user")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe("00000000-0001-3370-a000-000000000001");
  });

  it("should return 200 OK and 3 users for Global Admin querying some other org", async () => {
    const res = await request(app)
      .get("/user")
      .send({ orgId: "10000000-0001-3370-0000-000000000001" })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0].id).toBe("00000000-0001-3370-a000-000000000011");
    expect(res.body[1].id).toBe("00000000-0001-3370-a000-000000000021");
    expect(res.body[2].id).toBe("00000000-0001-3370-a000-000000000031");
  });

  it("should return 200 OK and 3 users for Org1 Admin", async () => {
    const res = await request(app)
      .get("/user")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0].id).toBe("00000000-0001-3370-a000-000000000011");
    expect(res.body[1].id).toBe("00000000-0001-3370-a000-000000000021");
    expect(res.body[2].id).toBe("00000000-0001-3370-a000-000000000031");
  });

  it("should return 403 for Org1 User1", async () => {
    const res = await request(app)
      .get("/user")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(403);
  });

  it("should return 200 OK and 2 users of org2 for Org2 Admin", async () => {
    const res = await request(app)
      .get("/user")
      .set("Authorization", "Bearer ORG2_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].id).toBe("00000000-0001-3370-a000-000000000041");
    expect(res.body[1].id).toBe("00000000-0001-3370-a000-000000000051");
  });
});

describe("GET a specific user", () => {
  it("should return 400 Error for a random string", async () => {
    const res = await request(app)
      .get("/user/hello-world")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid value provided for `userId`");
  });

  it("should return 200 OK and one user of global org for Global Admin", async () => {
    const res = await request(app)
      .get("/user/00000000-0001-3370-a000-000000000001")
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe("00000000-0001-3370-a000-000000000001");
  });

  it("should return 200 OK and one user Global Admin querying some other org", async () => {
    const res = await request(app)
      .get("/user/00000000-0001-3370-a000-000000000031")
      .send({ orgId: "10000000-0001-3370-0000-000000000001" })
      .set("Authorization", "Bearer GLOBAL_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe("00000000-0001-3370-a000-000000000031");
  });

  it("should return 200 OK for Org1 Admin querying own user", async () => {
    const res = await request(app)
      .get("/user/00000000-0001-3370-a000-000000000031")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe("00000000-0001-3370-a000-000000000031");
  });

  it("should return 404 for Org1 Admin querying user in other org", async () => {
    const res = await request(app)
      .get("/user/00000000-0001-3370-a000-000000000051")
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res.statusCode).toBe(404);

    const res2 = await request(app)
      .get("/user/00000000-0001-3370-a000-000000000051")
      .send({ orgId: "10000000-0001-3370-0000-000000000002" })
      .set("Authorization", "Bearer ORG1_ADMIN_TOKEN");
    expect(res2.statusCode).toBe(404);
  });

  it("should return 403 for Org1 User1 even if user is in same org", async () => {
    const res = await request(app)
      .get("/user/00000000-0001-3370-a000-000000000031")
      .set("Authorization", "Bearer ORG1_USER1_TOKEN");
    expect(res.statusCode).toBe(403);
  });
});

export {};
