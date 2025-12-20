import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  VECTORIZE: VectorizeIndex;
  OPENAI_API_KEY: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use("*", cors());

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "midnight-mcp-api" }));

app.get("/health", (c) =>
  c.json({
    status: "healthy",
    environment: c.env.ENVIRONMENT,
    vectorize: !!c.env.VECTORIZE,
  })
);

// Generate embedding using OpenAI
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data[0].embedding;
}

// Search endpoint
app.post("/v1/search", async (c) => {
  try {
    const body = await c.req.json<{
      query: string;
      limit?: number;
      filter?: { language?: string };
    }>();

    const { query, limit = 10, filter } = body;

    if (!query) {
      return c.json({ error: "query is required" }, 400);
    }

    // Get embedding for query
    const embedding = await getEmbedding(query, c.env.OPENAI_API_KEY);

    // Search Vectorize
    const results = await c.env.VECTORIZE.query(embedding, {
      topK: limit,
      returnMetadata: "all",
      filter: filter?.language ? { language: filter.language } : undefined,
    });

    return c.json({
      results: results.matches.map((match) => ({
        content: match.metadata?.content || "",
        score: match.score,
        metadata: {
          repository: match.metadata?.repository,
          filePath: match.metadata?.filePath,
          language: match.metadata?.language,
          startLine: match.metadata?.startLine,
          endLine: match.metadata?.endLine,
        },
      })),
      query,
      totalResults: results.matches.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Search failed" }, 500);
  }
});

// Search Compact code
app.post("/v1/search/compact", async (c) => {
  try {
    const body = await c.req.json<{ query: string; limit?: number }>();
    const { query, limit = 10 } = body;

    if (!query) {
      return c.json({ error: "query is required" }, 400);
    }

    const embedding = await getEmbedding(query, c.env.OPENAI_API_KEY);

    const results = await c.env.VECTORIZE.query(embedding, {
      topK: limit,
      returnMetadata: "all",
      filter: { language: "compact" },
    });

    return c.json({
      results: results.matches.map((match) => ({
        content: match.metadata?.content || "",
        score: match.score,
        metadata: {
          repository: match.metadata?.repository,
          filePath: match.metadata?.filePath,
          language: match.metadata?.language,
          startLine: match.metadata?.startLine,
          endLine: match.metadata?.endLine,
        },
      })),
      query,
      totalResults: results.matches.length,
    });
  } catch (error) {
    console.error("Search compact error:", error);
    return c.json({ error: "Search failed" }, 500);
  }
});

// Search TypeScript code
app.post("/v1/search/typescript", async (c) => {
  try {
    const body = await c.req.json<{ query: string; limit?: number }>();
    const { query, limit = 10 } = body;

    if (!query) {
      return c.json({ error: "query is required" }, 400);
    }

    const embedding = await getEmbedding(query, c.env.OPENAI_API_KEY);

    const results = await c.env.VECTORIZE.query(embedding, {
      topK: limit,
      returnMetadata: "all",
      filter: { language: "typescript" },
    });

    return c.json({
      results: results.matches.map((match) => ({
        content: match.metadata?.content || "",
        score: match.score,
        metadata: {
          repository: match.metadata?.repository,
          filePath: match.metadata?.filePath,
          language: match.metadata?.language,
          startLine: match.metadata?.startLine,
          endLine: match.metadata?.endLine,
        },
      })),
      query,
      totalResults: results.matches.length,
    });
  } catch (error) {
    console.error("Search typescript error:", error);
    return c.json({ error: "Search failed" }, 500);
  }
});

// Search docs
app.post("/v1/search/docs", async (c) => {
  try {
    const body = await c.req.json<{ query: string; limit?: number }>();
    const { query, limit = 10 } = body;

    if (!query) {
      return c.json({ error: "query is required" }, 400);
    }

    const embedding = await getEmbedding(query, c.env.OPENAI_API_KEY);

    const results = await c.env.VECTORIZE.query(embedding, {
      topK: limit,
      returnMetadata: "all",
      filter: { language: "markdown" },
    });

    return c.json({
      results: results.matches.map((match) => ({
        content: match.metadata?.content || "",
        score: match.score,
        metadata: {
          repository: match.metadata?.repository,
          filePath: match.metadata?.filePath,
          language: match.metadata?.language,
          startLine: match.metadata?.startLine,
          endLine: match.metadata?.endLine,
        },
      })),
      query,
      totalResults: results.matches.length,
    });
  } catch (error) {
    console.error("Search docs error:", error);
    return c.json({ error: "Search failed" }, 500);
  }
});

// Stats endpoint
app.get("/v1/stats", async (c) => {
  return c.json({
    service: "midnight-mcp-api",
    environment: c.env.ENVIRONMENT,
    vectorize: "connected",
  });
});

export default app;
