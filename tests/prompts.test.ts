import { describe, it, expect } from "vitest";
import { promptDefinitions, generatePrompt } from "../src/prompts/templates.js";

describe("Prompt Templates", () => {
  it("should list all available prompts", () => {
    expect(promptDefinitions.length).toBeGreaterThan(0);

    const promptNames = promptDefinitions.map((p) => p.name);
    // Midnight prompts
    expect(promptNames).toContain("midnight:create-contract");
    expect(promptNames).toContain("midnight:review-contract");
    expect(promptNames).toContain("midnight:explain-concept");
    expect(promptNames).toContain("midnight:nextjs-dapp");
    // Next.js prompts
    expect(promptNames).toContain("nextjs:upgrade-to-16");
    expect(promptNames).toContain("nextjs:enable-cache-components");
    expect(promptNames).toContain("nextjs:runtime-diagnostics");
  });

  it("should generate create-contract prompt", () => {
    const messages = generatePrompt("midnight:create-contract", {
      contractType: "token",
      privacyLevel: "full",
      complexity: "intermediate",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].role).toBe("user");
    expect(messages[0].content.text).toContain("token");
    expect(messages[0].content.text).toContain("full");
    expect(messages[0].content.text).toContain("intermediate");
  });

  it("should generate review-contract prompt", () => {
    const contractCode = `
ledger {
  counter: Counter;
}

export circuit increment(): Void {
  ledger.counter.increment(1);
}
    `;

    const messages = generatePrompt("midnight:review-contract", {
      contractCode,
      focusAreas: "security",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].content.text).toContain(contractCode);
    expect(messages[0].content.text).toContain("security");
  });

  it("should generate explain-concept prompt", () => {
    const messages = generatePrompt("midnight:explain-concept", {
      concept: "zero-knowledge proofs",
      level: "beginner",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].content.text).toContain("zero-knowledge proofs");
    expect(messages[0].content.text).toContain("beginner");
  });

  it("should generate compare-approaches prompt", () => {
    const messages = generatePrompt("midnight:compare-approaches", {
      problem: "private token transfers",
      approaches: "commitment-based, nullifier-based",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].content.text).toContain("private token transfers");
    expect(messages[0].content.text).toContain("commitment-based, nullifier-based");
  });

  it("should generate debug-contract prompt", () => {
    const messages = generatePrompt("midnight:debug-contract", {
      contractCode: "export circuit test(): Void {}",
      errorMessage: "Assertion failed at line 5",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].content.text).toContain("Assertion failed at line 5");
  });

  // Next.js DevTools prompt tests
  it("should generate nextjs:upgrade-to-16 prompt", () => {
    const messages = generatePrompt("nextjs:upgrade-to-16", {
      projectPath: "./my-app",
      includeReact19: "yes",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].role).toBe("user");
    expect(messages[0].content.text).toContain("./my-app");
    expect(messages[0].content.text).toContain("React 19");
    expect(messages[0].content.text).toContain("nextjs-upgrade-nextjs-16");
  });

  it("should generate nextjs:enable-cache-components prompt", () => {
    const messages = generatePrompt("nextjs:enable-cache-components", {
      projectPath: ".",
      strategy: "incremental",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].content.text).toContain("Cache Components");
    expect(messages[0].content.text).toContain("incremental");
    expect(messages[0].content.text).toContain("nextjs-enable-cache-components");
  });

  it("should generate nextjs:runtime-diagnostics prompt", () => {
    const messages = generatePrompt("nextjs:runtime-diagnostics", {
      issueType: "errors",
      port: "3001",
    });

    expect(messages.length).toBe(1);
    expect(messages[0].content.text).toContain("3001");
    expect(messages[0].content.text).toContain("get_errors");
    expect(messages[0].content.text).toContain("nextjs-nextjs-call");
  });
});
