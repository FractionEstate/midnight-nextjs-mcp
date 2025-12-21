# Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        MCP Client                                │
│                (Claude Desktop, Cursor, etc.)                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ JSON-RPC 2.0 / stdio
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      midnight-mcp                                │
│  ┌────────────┐  ┌─────────────┐  ┌────────────┐                │
│  │ 19 Tools   │  │ 20 Resources│  │ 5 Prompts  │                │
│  │ + 4 Templ  │  │ + Sampling  │  │            │                │
│  └────────────┘  └─────────────┘  └────────────┘                │
└──────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Hosted API  │    │   GitHub    │    │   Parser    │
    │  (default)  │    │  (Octokit)  │    │  (Compact)  │
    └─────────────┘    └─────────────┘    └─────────────┘
           │
           ▼ (local mode only)
    ┌─────────────┐    ┌─────────────┐
    │  ChromaDB   │◄───│   OpenAI    │
    └─────────────┘    └─────────────┘
```

## Modes

**Hosted mode** (default): Search requests go to a hosted API. Zero configuration.

**Local mode**: Set `MIDNIGHT_LOCAL=true`. Requires ChromaDB + OpenAI API key. Search runs locally with your own embeddings.

## Repositories

### Indexed for Semantic Search (24)

All public Midnight repositories are indexed (~26,000 documents):

| Category            | Repositories                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| Core Language & SDK | compact, midnight-js, midnight-wallet, midnight-dapp-connector-api                  |
| Infrastructure      | midnight-node, midnight-indexer, midnight-ledger, midnight-zk                       |
| Documentation       | midnight-docs (incl. blog, /compact, API ref), midnight-improvement-proposals       |
| Examples            | example-counter, example-bboard, example-dex, midnight-awesome-dapps, create-mn-app |
| ZK & Cryptography   | halo2, midnight-trusted-setup                                                       |
| Developer Tools     | compact-tree-sitter, compact-zed, setup-compact-action, midnight-node-docker        |
| Community           | contributor-hub, night-token-distribution                                           |
| Third-Party         | OpenZeppelin/compact-contracts                                                      |

### Available via GitHub Tools (16)

Additional repositories accessible via `midnight-get-file` and other GitHub tools:

| Repository                    | Contents              |
| ----------------------------- | --------------------- |
| `example-dex`                 | DEX example           |
| `create-mn-app`               | CLI scaffolding       |
| `midnight-wallet`             | Wallet implementation |
| `midnight-indexer`            | Blockchain indexer    |
| `midnight-node-docker`        | Node Docker configs   |
| `midnight-dapp-connector-api` | DApp connector API    |
| `compact-tree-sitter`         | Tree-sitter grammar   |
| `midnight-awesome-dapps`      | Community DApp list   |
| `contributor-hub`             | Contributor resources |

## Components

### Tools (`src/tools/`)

| Tool                              | Purpose                                        |
| --------------------------------- | ---------------------------------------------- |
| `midnight-search-compact`         | Semantic search over Compact code              |
| `midnight-search-typescript`      | Semantic search over TypeScript SDK            |
| `midnight-search-docs`            | Semantic search over documentation             |
| `midnight-analyze-contract`       | Static analysis: structure, patterns, security |
| `midnight-explain-circuit`        | Explain circuit logic and ZK implications      |
| `midnight-get-file`               | Fetch file from GitHub                         |
| `midnight-list-examples`          | List example contracts                         |
| `midnight-get-latest-updates`     | Recent commits                                 |
| `midnight-get-version-info`       | Latest release info                            |
| `midnight-check-breaking-changes` | Breaking changes since version X               |
| `midnight-get-migration-guide`    | Upgrade guide between versions                 |
| `midnight-get-file-at-version`    | File content at specific tag                   |
| `midnight-compare-syntax`         | Diff file between versions                     |
| `midnight-get-latest-syntax`      | Canonical syntax reference                     |
| `midnight-health-check`           | Server health                                  |
| `midnight-get-status`             | Rate limits, cache stats                       |
| `midnight-generate-contract`      | AI-generate contracts from natural language    |
| `midnight-review-contract`        | AI-powered security review                     |
| `midnight-document-contract`      | AI-generate documentation                      |

### Advanced MCP Features (v0.1.0+)

**Tool Annotations**: All tools include behavioral hints:

- `readOnlyHint` - Tool doesn't modify state
- `idempotentHint` - Safe to retry
- `openWorldHint` - May return external data
- `longRunningHint` - May take time

**Output Schemas**: JSON schemas for structured tool outputs.

**Resource Templates** (RFC 6570):

- `midnight://code/{owner}/{repo}/{path}` - Any code file
- `midnight://docs/{section}/{topic}` - Documentation
- `midnight://examples/{category}/{name}` - Example contracts
- `midnight://schema/{type}` - JSON schemas

**Sampling**: Server can request LLM completions via client (for AI tools).

**Subscriptions**: Subscribe to resource change notifications.

### Resources (`src/resources/`)

Accessible via `midnight://` URIs:

**Documentation**

- `midnight://docs/compact-reference`
- `midnight://docs/sdk-api`
- `midnight://docs/concepts/zero-knowledge`
- `midnight://docs/concepts/shielded-state`
- `midnight://docs/concepts/witnesses`
- `midnight://docs/concepts/kachina`

**Code**

- `midnight://code/examples/counter`
- `midnight://code/examples/bboard`
- `midnight://code/patterns/state-management`
- `midnight://code/patterns/access-control`
- `midnight://code/patterns/privacy-preserving`
- `midnight://code/templates/token`
- `midnight://code/templates/voting`

**Schemas**

- `midnight://schema/compact-ast`
- `midnight://schema/transaction`
- `midnight://schema/proof`

### Prompts (`src/prompts/`)

| Prompt                        | Use case                 |
| ----------------------------- | ------------------------ |
| `midnight-create-contract`    | New contract scaffolding |
| `midnight-review-contract`    | Security review          |
| `midnight-explain-concept`    | Learn Midnight concepts  |
| `midnight-compare-approaches` | Compare implementations  |
| `midnight-debug-contract`     | Debug contract issues    |

## Data Flow

### Search (hosted mode)

```
Query → Hosted API → Vector search → Results
```

### Search (local mode)

```
Query → OpenAI embedding → ChromaDB query → Results
```

### Contract Analysis

```
Code → Parser → Structure extraction → Pattern detection → Security checks → Report
```

### Resource Read

```
URI → Map to provider → Fetch from GitHub (cached) → Content
```

## File Structure

```
src/
├── index.ts           # Entry point
├── server.ts          # MCP server, request handlers
├── tools/
│   ├── search.ts      # Search tools (3)
│   ├── analyze.ts     # Analysis tools (2)
│   └── repository.ts  # GitHub tools (11)
├── resources/
│   ├── docs.ts        # Documentation URIs
│   ├── code.ts        # Code examples URIs
│   └── schemas.ts     # Schema URIs
├── prompts/
│   └── templates.ts   # Prompt definitions
├── pipeline/
│   ├── github.ts      # GitHub API client
│   ├── parser.ts      # Compact/TS parsing
│   └── indexer.ts     # Indexing orchestration
├── db/
│   └── vectorStore.ts # ChromaDB client
└── utils/
    ├── config.ts      # Configuration
    ├── hosted-api.ts  # Hosted API client
    └── logger.ts      # Logging
```

## Graceful Degradation

| Missing         | Behavior                               |
| --------------- | -------------------------------------- |
| Hosted API down | Falls back to local mode if configured |
| OpenAI API key  | Search disabled                        |
| ChromaDB        | Search returns empty                   |
| GitHub token    | 60 req/hr limit (vs 5000 with token)   |

## Security

- Read-only: no write operations
- Secrets in env vars, never logged
- Input validation via Zod
- Rate limiting respected
- Local mode: data stays on your machine
