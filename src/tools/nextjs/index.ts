/**
 * Next.js DevTools Integration
 * Bridges next-devtools-mcp tools, resources, and prompts into midnight-nextjs-mcp
 *
 * This module spawns next-devtools-mcp as a subprocess and proxies
 * tool calls to it, providing a unified development experience
 * for Midnight + Next.js projects.
 */

import { ChildProcess } from "child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ExtendedToolDefinition } from "../../types/index.js";
import { logger } from "../../utils/index.js";

// State for the next-devtools-mcp client
let nextDevToolsClient: Client | null = null;
let nextDevToolsProcess: ChildProcess | null = null;
let nextDevToolsAvailable = false;
let nextDevToolsList: Array<{
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}> = [];
let nextDevToolsResources: Array<{
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}> = [];
let nextDevToolsPrompts: Array<{
  name: string;
  description?: string;
  arguments?: Array<{ name: string; description?: string; required?: boolean }>;
}> = [];

/**
 * Initialize next-devtools-mcp integration by spawning it as a subprocess
 * Called during server startup
 */
export async function initNextDevTools(): Promise<boolean> {
  try {
    // Check if next-devtools-mcp is available
    const { execSync } = await import("child_process");
    try {
      execSync("npx next-devtools-mcp --version", { stdio: "ignore" });
    } catch {
      // Package not available, try to use directly if installed
    }

    // Create the MCP client
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "next-devtools-mcp@latest"],
    });

    nextDevToolsClient = new Client(
      {
        name: "midnight-nextjs-mcp-bridge",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Connect to the next-devtools-mcp server
    await nextDevToolsClient.connect(transport);

    // List available tools
    const toolsResponse = await nextDevToolsClient.listTools();
    nextDevToolsList = toolsResponse.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "",
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));

    // List available resources
    try {
      const resourcesResponse = await nextDevToolsClient.listResources();
      nextDevToolsResources = resourcesResponse.resources.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      }));
      logger.info(`Loaded ${nextDevToolsResources.length} resources from next-devtools-mcp`);
    } catch {
      logger.warn("Failed to load resources from next-devtools-mcp");
    }

    // List available prompts
    try {
      const promptsResponse = await nextDevToolsClient.listPrompts();
      nextDevToolsPrompts = promptsResponse.prompts.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments?.map((arg) => ({
          name: arg.name,
          description: arg.description,
          required: arg.required,
        })),
      }));
      logger.info(`Loaded ${nextDevToolsPrompts.length} prompts from next-devtools-mcp`);
    } catch {
      logger.warn("Failed to load prompts from next-devtools-mcp");
    }

    nextDevToolsAvailable = true;
    logger.info(
      `next-devtools-mcp integration initialized with ${nextDevToolsList.length} tools, ${nextDevToolsResources.length} resources, ${nextDevToolsPrompts.length} prompts`
    );
    return true;
  } catch (error) {
    logger.warn(
      "next-devtools-mcp not available - Next.js tools will be disabled",
      { error: error instanceof Error ? error.message : String(error) }
    );
    nextDevToolsAvailable = false;
    return false;
  }
}

/**
 * Cleanup next-devtools-mcp connection
 */
export async function cleanupNextDevTools(): Promise<void> {
  if (nextDevToolsClient) {
    try {
      await nextDevToolsClient.close();
    } catch {
      // Ignore cleanup errors
    }
    nextDevToolsClient = null;
  }
  if (nextDevToolsProcess) {
    nextDevToolsProcess.kill();
    nextDevToolsProcess = null;
  }
  nextDevToolsAvailable = false;
  nextDevToolsList = [];
  nextDevToolsResources = [];
  nextDevToolsPrompts = [];
}

/**
 * Get all Next.js DevTools as MCP tool definitions
 * Tools are prefixed with 'nextjs-' to integrate cleanly with midnight-nextjs-mcp
 */
export function getNextJsTools(): ExtendedToolDefinition[] {
  if (!nextDevToolsAvailable || nextDevToolsList.length === 0) {
    return [];
  }

  return nextDevToolsList.map((tool) => {
    // Convert tool name: init -> nextjs-init, browser_eval -> nextjs-browser-eval
    const toolName = `nextjs-${tool.name.replace(/_/g, "-")}`;

    // Create a dummy handler - actual calls go through callNextJsTool
    const handler = async () => ({
      error: "Use callNextJsTool instead",
    });

    // Ensure inputSchema has the right shape
    const inputSchema = tool.inputSchema as {
      type?: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };

    return {
      name: toolName,
      description: `[Next.js DevTools] ${tool.description}`,
      inputSchema: {
        type: "object" as const,
        properties: inputSchema.properties || {},
        required: inputSchema.required,
      },
      handler,
      annotations: {
        title: `Next.js: ${tool.name.replace(/_/g, " ")}`,
        readOnlyHint: false, // These tools may modify project files
        openWorldHint: true, // They interact with external systems
      },
    };
  });
}

/**
 * Call a Next.js DevTools function by name
 */
export async function callNextJsTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  if (!nextDevToolsAvailable || !nextDevToolsClient) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: "next-devtools-mcp is not available",
            hint: "The Next.js DevTools integration failed to initialize. Try restarting the server.",
          }),
        },
      ],
    };
  }

  // Convert tool name back: nextjs-browser-eval -> browser_eval
  const originalName = name.replace(/^nextjs-/, "").replace(/-/g, "_");

  try {
    // Call the tool through the MCP client
    const result = await nextDevToolsClient.callTool({
      name: originalName,
      arguments: args,
    });

    // Extract text content from the result
    const content = result.content as Array<{ type: string; text?: string }>;
    const textContent = content
      .filter((c): c is { type: "text"; text: string } => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: textContent || JSON.stringify(result),
        },
      ],
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Error calling Next.js tool ${name}:`, { error: error.message });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error.message,
            tool: name,
            originalTool: originalName,
          }),
        },
      ],
    };
  }
}

/**
 * Check if a tool name belongs to Next.js DevTools
 */
export function isNextJsTool(name: string): boolean {
  return name.startsWith("nextjs-");
}

/**
 * Check if Next.js DevTools integration is available
 */
export function isNextDevToolsAvailable(): boolean {
  return nextDevToolsAvailable;
}

/**
 * Get list of Next.js DevTools resources
 */
export function getNextJsResources(): typeof nextDevToolsResources {
  return nextDevToolsResources;
}

/**
 * Get list of Next.js DevTools prompts
 */
export function getNextJsPrompts(): typeof nextDevToolsPrompts {
  return nextDevToolsPrompts;
}

/**
 * Read a resource from next-devtools-mcp
 */
export async function readNextJsResource(uri: string): Promise<string | null> {
  if (!nextDevToolsAvailable || !nextDevToolsClient) {
    return null;
  }

  try {
    const response = await nextDevToolsClient.readResource({ uri });
    const content = response.contents[0];
    if (content && "text" in content) {
      return content.text;
    }
    return null;
  } catch (err) {
    logger.error(`Error reading Next.js resource ${uri}:`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Get a prompt from next-devtools-mcp
 */
export async function getNextJsPrompt(
  name: string,
  args?: Record<string, string>
): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> } | null> {
  if (!nextDevToolsAvailable || !nextDevToolsClient) {
    return null;
  }

  try {
    const response = await nextDevToolsClient.getPrompt({
      name,
      arguments: args,
    });
    return {
      messages: response.messages.map((m) => ({
        role: m.role,
        content: {
          type: "text",
          text: typeof m.content === "string" ? m.content : (m.content as { text: string }).text || "",
        },
      })),
    };
  } catch (err) {
    logger.error(`Error getting Next.js prompt ${name}:`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// Tool definitions for the integration status tool
export const nextjsIntegrationTools: ExtendedToolDefinition[] = [
  {
    name: "midnight-nextjs-status",
    description:
      "Check the status of Next.js DevTools integration and list available tools, resources, and prompts",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
    handler: async () => handleNextJsStatus(),
    annotations: {
      title: "Next.js Integration Status",
      readOnlyHint: true,
      openWorldHint: false,
    },
  },
];

/**
 * Handler for midnight-nextjs-status tool
 */
export async function handleNextJsStatus(): Promise<{
  available: boolean;
  tools: string[];
  resources: string[];
  prompts: string[];
  message: string;
}> {
  if (!nextDevToolsAvailable) {
    return {
      available: false,
      tools: [],
      resources: [],
      prompts: [],
      message:
        "next-devtools-mcp is not connected. " +
        "This may be because the package is not installed or failed to start. " +
        "Try restarting the MCP server.",
    };
  }

  const tools = nextDevToolsList.map(
    (t) => `nextjs-${t.name.replace(/_/g, "-")}`
  );
  const resources = nextDevToolsResources.map((r) => r.uri);
  const prompts = nextDevToolsPrompts.map((p) => p.name);

  return {
    available: true,
    tools,
    resources,
    prompts,
    message: `Next.js DevTools integration active with ${tools.length} tools, ${resources.length} resources, ${prompts.length} prompts available.`,
  };
}
