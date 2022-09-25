import express, { Express, Request, Response } from "express";

import { router as orgRoutes } from "./api/orgRoutes";
import { router as userRoutes } from "./api/userRoutes";
import { router as linkRoutes } from "./api/linkRoutes";
import { router as authRoutes } from "./api/authRoutes";

const app: Express = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/org", orgRoutes);
app.use("/user", userRoutes);
app.use("/link", linkRoutes);
app.use("/auth", authRoutes);

app.use((_req: Request, res: Response) => {
  return res.status(404);
});

app.listen(port, () => {
  console.log(`SlashGo-Server listening on port ${port}`);
});