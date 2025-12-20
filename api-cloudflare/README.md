# Midnight MCP API (Cloudflare Workers)

Cloudflare Workers + Vectorize backend for midnight-mcp semantic search.

## Setup

```bash
cd api-cloudflare
npm install
```

## Create Vectorize Index

```bash
npm run create-index
```

## Add OpenAI API Key

```bash
npx wrangler secret put OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

## Index Repositories

Set environment variables and run indexing:

```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_API_TOKEN=your_api_token
export OPENAI_API_KEY=your_openai_key
export GITHUB_TOKEN=your_github_token  # Optional, for higher rate limits

npm run index
```

## Deploy

```bash
npm run deploy
```

## Local Development

```bash
npm run dev
```

## Endpoints

| Endpoint                | Method | Description          |
| ----------------------- | ------ | -------------------- |
| `/health`               | GET    | Health check         |
| `/v1/search`            | POST   | Generic search       |
| `/v1/search/compact`    | POST   | Search Compact code  |
| `/v1/search/typescript` | POST   | Search TypeScript    |
| `/v1/search/docs`       | POST   | Search documentation |
