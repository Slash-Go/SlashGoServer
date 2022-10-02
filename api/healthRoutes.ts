import express, { Request, Response } from "express";

export const router = express.Router();

router.get("/status", (_: Request, resp: Response) => {
  return resp.status(200).send(`OK`);
});

module.exports = { router };
