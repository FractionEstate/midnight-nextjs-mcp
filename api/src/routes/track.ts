/**
 * Tool tracking route
 */

import { Hono } from "hono";
import type { Bindings } from "../interfaces";
import { trackToolCall, persistMetrics, loadMetrics } from "../services";

const trackRoutes = new Hono<{ Bindings: Bindings }>();

interface TrackRequest {
  tool: string;
  success: boolean;
  durationMs?: number;
  version?: string;
}

// Track a tool call
trackRoutes.post("/tool", async (c) => {
  try {
    await loadMetrics(c.env.METRICS);

    const body = await c.req.json<TrackRequest>();

    if (!body.tool || typeof body.tool !== "string") {
      return c.json({ error: "tool name is required" }, 400);
    }

    trackToolCall(
      body.tool,
      body.success !== false, // default to true
      body.durationMs,
      body.version
    );

    await persistMetrics(c.env.METRICS);

    return c.json({ tracked: true });
  } catch (error) {
    console.error("Track error:", error);
    return c.json({ error: "Track failed" }, 500);
  }
});

export default trackRoutes;
