import request from "supertest";
import { app } from "../index";

describe("GET /health/status", () => {
  it("should return 200 OK", async () => {
    const res = await request(app).get("/health/status");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("OK");
  });
});

export {};
