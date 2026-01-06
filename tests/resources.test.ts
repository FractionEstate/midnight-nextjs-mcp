import { describe, it, expect } from "vitest";
import {
  documentationResources,
  getDocumentation,
} from "../src/resources/docs.js";
import { codeResources, getCode } from "../src/resources/code.js";
import { schemaResources, getSchema } from "../src/resources/schemas.js";

describe("Documentation Resources", () => {
  it("should list all documentation resources", () => {
    expect(documentationResources.length).toBeGreaterThan(0);

    const uris = documentationResources.map((r) => r.uri);
    expect(uris).toContain("midnight://docs/compact-reference");
    expect(uris).toContain("midnight://docs/sdk-api");
  });

  it("should get compact reference documentation", async () => {
    const content = await getDocumentation("midnight://docs/compact-reference");

    expect(content).toBeTruthy();
    expect(content).toContain("Compact");
    expect(content).toContain("ledger");
    expect(content).toContain("circuit");
  });

  it("should get SDK API documentation", async () => {
    const content = await getDocumentation("midnight://docs/sdk-api");

    expect(content).toBeTruthy();
    expect(content).toContain("TypeScript");
    expect(content).toContain("@midnight-ntwrk");
  });

  it("should get tokenomics documentation", async () => {
    const content = await getDocumentation("midnight://docs/tokenomics");

    expect(content).toBeTruthy();
    expect(content).toContain("NIGHT");
    expect(content).toContain("token");
  });
});

describe("Code Resources", () => {
  it("should list all code resources", () => {
    expect(codeResources.length).toBeGreaterThan(0);

    const uris = codeResources.map((r) => r.uri);
    expect(uris).toContain("midnight://code/examples/counter");
    expect(uris).toContain("midnight://code/templates/token");
  });

  it("should get counter example code", async () => {
    const content = await getCode("midnight://code/examples/counter");

    expect(content).toBeTruthy();
    expect(content).toContain("ledger");
    expect(content).toContain("circuit");
    expect(content).toContain("Counter");
  });

  it("should get token template code", async () => {
    const content = await getCode("midnight://code/templates/token");

    expect(content).toBeTruthy();
    expect(content).toContain("transfer");
    expect(content).toContain("balance");
  });

  it("should get patterns code", async () => {
    const content = await getCode(
      "midnight://code/patterns/privacy-preserving"
    );

    expect(content).toBeTruthy();
    expect(content).toContain("commit");
    expect(content).toContain("nullifier");
  });

  // Next.js integration resources
  it("should list Next.js integration resources", () => {
    const uris = codeResources.map((r) => r.uri);
    expect(uris).toContain("midnight://code/integration/nextjs-provider");
    expect(uris).toContain("midnight://code/integration/nextjs-hooks");
    expect(uris).toContain("midnight://code/integration/turbo-config");
    expect(uris).toContain("midnight://code/integration/nextjs-devtools");
    expect(uris).toContain("midnight://code/integration/cache-components-guide");
    expect(uris).toContain("midnight://code/integration/nextjs16-migration");
  });

  it("should get Next.js DevTools integration guide", async () => {
    const content = await getCode("midnight://code/integration/nextjs-devtools");
    expect(content).toBeTruthy();
    expect(content).toContain("nextjs-init");
    expect(content).toContain("nextjs-nextjs-docs");
    expect(content).toContain("nextjs-browser-eval");
  });

  it("should get Cache Components guide", async () => {
    const content = await getCode("midnight://code/integration/cache-components-guide");
    expect(content).toBeTruthy();
    expect(content).toContain("Cache Components");
    expect(content).toContain("Public caches");
    expect(content).toContain("Private caches");
  });

  it("should get Next.js 16 migration guide", async () => {
    const content = await getCode("midnight://code/integration/nextjs16-migration");
    expect(content).toBeTruthy();
    expect(content).toContain("async");
    expect(content).toContain("params");
    expect(content).toContain("searchParams");
  });
});

describe("Schema Resources", () => {
  it("should list all schema resources", () => {
    expect(schemaResources.length).toBeGreaterThan(0);

    const uris = schemaResources.map((r) => r.uri);
    expect(uris).toContain("midnight://schema/compact-ast");
    expect(uris).toContain("midnight://schema/transaction");
  });

  it("should get compact AST schema", () => {
    const schema = getSchema("midnight://schema/compact-ast");

    expect(schema).toBeTruthy();
    expect(schema).toHaveProperty("$schema");
    expect(schema).toHaveProperty("definitions");
  });

  it("should get transaction schema", () => {
    const schema = getSchema("midnight://schema/transaction");

    expect(schema).toBeTruthy();
    expect(schema).toHaveProperty("properties");
  });

  it("should get proof schema", () => {
    const schema = getSchema("midnight://schema/proof");

    expect(schema).toBeTruthy();
    expect(schema).toHaveProperty("properties");
  });
});
