/**
 * Midnight MCP API
 *
 * A Cloudflare Worker API for semantic search across Midnight repositories.
 * Provides search endpoints for Compact, TypeScript, and documentation.
 * Also implements MCP Registry v0.1 specification for server discovery.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings } from "./interfaces";
import {
  healthRoutes,
  searchRoutes,
  statsRoutes,
  dashboardRoute,
  trackRoutes,
  webhookRoutes,
  registryRoutes,
} from "./routes";

const app = new Hono<{ Bindings: Bindings }>();

// CORS - allow all origins for public API
// Required for MCP clients to fetch registry data
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

// Mount routes
app.route("/", healthRoutes);
app.route("/v1/search", searchRoutes);
app.route("/v1/stats", statsRoutes);
app.route("/v1/track", trackRoutes);
app.route("/v1/webhook", webhookRoutes);
app.route("/dashboard", dashboardRoute);

// MCP Registry v0.1 API
app.route("/v0.1", registryRoutes);

export default app;
