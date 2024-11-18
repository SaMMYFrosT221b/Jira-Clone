import { Hono } from "hono";
import { handle } from "hono/vercel";

import authRouter from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route";
import members from "@/features/members/server/route";

const app = new Hono().basePath("/api");

const router = app
  .route("/auth", authRouter)
  .route("/workspaces", workspaces)
  .route("/members", members);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof router;
