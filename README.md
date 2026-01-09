# Midnight + Next.js Development MCP Server

A Model Context Protocol (MCP) server combining Midnight Network blockchain development tools with Next.js DevTools for building decentralized applications.

> **Compatible with all MCP-enabled AI assistants:** Claude, GitHub Copilot, Cursor, Windsurf, Codeium, Continue.dev, Zed, Sourcegraph Cody, and more.

## 🤖 Supported AI Assistants

This MCP server works with any AI assistant that supports the Model Context Protocol:

| AI Assistant | Platform | Configuration |
|--------------|----------|---------------|
| **Claude** | Desktop App, VS Code | Native MCP support |
| **GitHub Copilot** | VS Code, JetBrains | MCP extension |
| **Cursor** | IDE | Built-in MCP support |
| **Windsurf** | IDE | Built-in MCP support |
| **Codeium** | VS Code, JetBrains | MCP integration |
| **Continue.dev** | VS Code, JetBrains | MCP config file |
| **Zed** | IDE | MCP support |
| **Sourcegraph Cody** | VS Code | MCP extension |

## 🌙 Features

### Midnight Network Tools
- **`midnight_init`** - Initialize development context
- **`midnight_network_status`** - Check network health (Indexer, Proof Server, Node)
- **`midnight_get_balance`** - Query token balances
- **`midnight_get_block`** - Query blockchain blocks
- **`midnight_get_transaction`** - Query transaction details
- **`midnight_search_docs`** - Search Midnight documentation
- **`midnight_scaffold_project`** - Create new dApp projects
- **`midnight_compile_contract`** - Compile Compact contracts
- **`midnight_analyze_contract`** - Static analysis for contracts

### Next.js DevTools
- **`init`** - Initialize Next.js development context
- **`nextjs_docs`** - Search Next.js documentation
- **`nextjs_index`** - Discover running dev servers
- **`nextjs_call`** - Execute runtime diagnostic tools
- **`browser_eval`** - Browser automation with Playwright
- **`upgrade_nextjs_16`** - Next.js 16 upgrade guide
- **`enable_cache_components`** - Cache Components migration

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/midnight-nextjs-mcp.git
cd midnight-nextjs-mcp

# Install dependencies
pnpm install

# Build
pnpm build
```

## 🚀 Usage

### Quick Start with npx

The easiest way to use this MCP server is via npx — no installation required:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

### Configuration Examples

The MCP configuration format is standardized across most AI assistants. Below are platform-specific examples:

---

#### Universal MCP Configuration

Most MCP clients use this standard JSON format. Add to your client's MCP configuration file:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

---

#### VS Code (GitHub Copilot / Claude Extension)

Add to your VS Code `settings.json` or workspace `.vscode/mcp.json`:

```json
{
  "mcp.servers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

Or for Claude extension specifically:

```json
{
  "claude.mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

#### Claude Desktop (macOS)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

#### Claude Desktop (Windows)

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

#### Claude Desktop (Linux)

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

#### Cursor IDE

Add to your Cursor MCP configuration (`.cursor/mcp.json` in your project or global settings):

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

#### Windsurf / Codeium

Add to your Windsurf MCP settings:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

---

#### Continue.dev (VS Code / JetBrains)

Add to `~/.continue/config.json` or your project's `.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "name": "midnight-nextjs-mcp",
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "midnight-nextjs-mcp@latest"]
        }
      }
    ]
  }
}
```

---

#### Zed Editor

Add to your Zed settings (`~/.config/zed/settings.json` on Linux, `~/Library/Application Support/Zed/settings.json` on macOS):

```json
{
  "context_servers": {
    "midnight-nextjs-mcp": {
      "command": {
        "path": "npx",
        "args": ["-y", "midnight-nextjs-mcp@latest"]
      }
    }
  }
}
```

---

#### Sourcegraph Cody

Add to your Cody MCP configuration:

```json
{
  "cody.experimental.mcp.servers": {
    "midnight-nextjs-mcp": {
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

---

#### JetBrains IDEs (IntelliJ, WebStorm, etc.)

For AI assistants in JetBrains IDEs that support MCP, add to your MCP configuration:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"]
    }
  }
}
```

---

#### Using Global Installation

If you prefer a global install instead of npx:

```bash
npm install -g midnight-nextjs-mcp
```

Then configure:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "midnight-nextjs-mcp"
    }
  }
}
```

#### Local Development / From Source

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/midnight-nextjs-mcp/dist/index.js"]
    }
  }
}
```

---

#### Docker

Run the MCP server in a Docker container:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "docker",
      "args": ["run", "-i", "--rm", "fractionestate/midnight-nextjs-mcp:latest"]
    }
  }
}
```

### CLI Flags

```bash
# Enable both tool categories (default)
node dist/index.js

# Disable Midnight tools
node dist/index.js --no-midnight

# Disable Next.js tools
node dist/index.js --no-nextjs
```

## 🏗️ Project Structure

```
midnight-nextjs-mcp/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── tools/
│   │   ├── index.ts                # Unified tool registry
│   │   ├── midnight/               # Midnight Network tools
│   │   │   ├── init.ts
│   │   │   ├── network-status.ts
│   │   │   ├── get-balance.ts
│   │   │   ├── get-block.ts
│   │   │   ├── get-transaction.ts
│   │   │   ├── search-docs.ts
│   │   │   ├── scaffold-project.ts
│   │   │   ├── compile-contract.ts
│   │   │   └── analyze-contract.ts
│   │   └── nextjs/                 # Next.js DevTools
│   │       ├── init.ts
│   │       ├── nextjs-docs.ts
│   │       ├── nextjs_index.ts
│   │       ├── nextjs_call.ts
│   │       ├── browser-eval.ts
│   │       ├── upgrade-nextjs-16.ts
│   │       └── enable-cache-components.ts
│   ├── providers/                  # Midnight API providers
│   │   ├── index.ts
│   │   ├── indexer.ts              # GraphQL indexer client
│   │   ├── proof-server.ts         # Proof generation client
│   │   └── node.ts                 # Node RPC client
│   ├── resources/                  # MCP resources
│   │   ├── (midnight-compact)/     # Compact language docs
│   │   ├── (midnight-sdk)/         # SDK documentation
│   │   ├── (cache-components)/     # Next.js cache docs
│   │   └── ...
│   ├── prompts/                    # MCP prompts
│   │   ├── create-midnight-contract.ts
│   │   ├── upgrade-nextjs-16.ts
│   │   └── enable-cache-components.ts
│   └── types/                      # TypeScript definitions
│       ├── midnight.ts
│       └── mcp.ts
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

You can pass environment variables to the MCP server in your configuration:

```json
{
  "mcpServers": {
    "midnight-nextjs-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "midnight-nextjs-mcp@latest"],
      "env": {
        "MIDNIGHT_NETWORK": "testnet",
        "MIDNIGHT_INDEXER_URL": "https://indexer.testnet.midnight.network/graphql"
      }
    }
  }
}
```

#### Available Environment Variables

```bash
# Midnight Network (optional, defaults to testnet)
MIDNIGHT_NETWORK=testnet
MIDNIGHT_INDEXER_URL=https://indexer.testnet.midnight.network/graphql
MIDNIGHT_PROOF_SERVER_URL=https://proof-server.testnet.midnight.network
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network
```

### Network Configurations

| Network | Indexer | Proof Server |
|---------|---------|--------------|
| Testnet | indexer.testnet.midnight.network | proof-server.testnet.midnight.network |
| Devnet | localhost:8080 | localhost:6300 |

## 📚 Resources

The server exposes documentation resources:

### Midnight Resources
- `midnight://compact/overview` - Compact language introduction
- `midnight://compact/reference` - Complete syntax reference
- `midnight://sdk/overview` - Midnight.js SDK guide

### Next.js Resources
- `nextjs-docs://llms-index` - Documentation index
- `cache-components://overview` - Cache Components guide

## 🧪 Development

```bash
# Watch mode
pnpm dev

# Type check
pnpm typecheck

# Run tests
pnpm test

# Build
pnpm build
```

## 📖 Documentation

- [Midnight Network Docs](https://docs.midnight.network)
- [Next.js Docs](https://nextjs.org/docs)
- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)

### Client-Specific MCP Documentation

- [Claude Desktop MCP Guide](https://docs.anthropic.com/en/docs/claude-mcp)
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-mcp)
- [Cursor MCP Docs](https://docs.cursor.com/context/model-context-protocol)
- [Continue.dev MCP Guide](https://docs.continue.dev/customization/context-providers#mcp-servers)
- [Zed MCP Documentation](https://zed.dev/docs/assistant/context-servers)

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the Midnight and Next.js communities.
