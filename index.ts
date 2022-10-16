import express, { Express, Request, Response } from "express";

import { router as orgRoutes } from "./api/orgRoutes";
import { router as userRoutes } from "./api/userRoutes";
import { router as linkRoutes } from "./api/linkRoutes";
import { router as authRoutes } from "./api/authRoutes";
import { router as healthRoutes } from "./api/healthRoutes";

export const app: Express = express();

// Remove `x-powered-by` header
app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/org", orgRoutes);
app.use("/user", userRoutes);
app.use("/link", linkRoutes);
app.use("/auth", authRoutes);
app.use("/health", healthRoutes);

app.use((_req: Request, res: Response) => {
  return res.status(404);
});
