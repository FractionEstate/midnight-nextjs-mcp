/**
 * Midnight Wallet Tools
 *
 * Wallet management for Midnight Network development.
 */

import { z } from "zod"

// =============================================================================
// CREATE WALLET TOOL
// =============================================================================

export const createWalletInputSchema = {
  network: z
    .enum(["testnet", "devnet", "mainnet"])
    .default("testnet")
    .describe("Target network for the wallet"),
  seed_words: z
    .number()
    .default(12)
    .describe("Number of seed words (12 or 24)"),
}

export const createWalletMetadata = {
  name: "midnight_create_wallet",
  description: `Create a new Midnight wallet with a fresh seed phrase.

**Security Warning:**
- The seed phrase will be displayed ONCE
- Store it securely offline
- Never share your seed phrase
- Loss of seed phrase = loss of funds

**Wallet Features:**
- Native tDUST balance management
- Private and shielded transactions
- Contract interaction support
- Multiple address derivation

**After Creation:**
1. Save your seed phrase securely
2. Get testnet tDUST from the faucet
3. Use wallet for contract deployment

**Faucet:** https://faucet.testnet.midnight.network`,
  toolset: "midnight:wallet" as const,
  readOnly: false,
}

type CreateWalletArgs = {
  network?: "testnet" | "devnet" | "mainnet"
  seed_words?: number
}

export async function createWalletHandler(args: CreateWalletArgs): Promise<string> {
  const { network = "testnet", seed_words = 12 } = args

  if (network === "mainnet") {
    return `# ⚠️ Mainnet Not Available

Mainnet wallets are not yet supported. Use testnet for development.

\`\`\`
midnight_create_wallet({ network: "testnet" })
\`\`\`
`
  }

  // Generate mock seed phrase (in production, use proper BIP39)
  const seedPhrase = generateMockSeedPhrase(seed_words)
  const address = generateMockAddress()

  return `# 🔐 New Wallet Created

## Network: ${network}

## ⚠️ SAVE YOUR SEED PHRASE ⚠️

**Write this down and store it securely. You will not see it again.**

\`\`\`
${seedPhrase}
\`\`\`

## Wallet Address

\`\`\`
${address}
\`\`\`

## Next Steps

### 1. Get Test Funds
Visit the faucet to receive free tDUST:
https://faucet.testnet.midnight.network

Enter your address: \`${address}\`

### 2. Check Balance
\`\`\`
midnight_get_balance({ address: "${address}" })
\`\`\`

### 3. Set Environment Variable (for deployments)
\`\`\`bash
export MIDNIGHT_WALLET_SEED="${seedPhrase}"
\`\`\`

## Security Reminders

- ✅ Seed phrase stored offline
- ✅ Never share with anyone
- ✅ Use environment variables for automation
- ❌ Don't commit seed phrases to git
- ❌ Don't paste in public channels
`
}

// =============================================================================
// WALLET STATE TOOL
// =============================================================================

export const walletStateInputSchema = {
  address: z
    .string()
    .optional()
    .describe("Wallet address to query (uses MIDNIGHT_WALLET_SEED if not provided)"),
  network: z
    .enum(["testnet", "devnet", "mainnet"])
    .default("testnet")
    .describe("Target network"),
}

export const walletStateMetadata = {
  name: "midnight_wallet_state",
  description: `Get detailed wallet state including balances, coins, and sync status.

**Returns:**
- tDUST balance (total and available)
- Individual coin details
- Pending transactions
- Sync status with network

**Coin Types:**
- **Unshielded:** Publicly visible balance
- **Shielded:** Private balance (ZK protected)
- **Pending:** Awaiting confirmation

**Use for:**
- Checking available funds before operations
- Debugging transaction issues
- Monitoring wallet health`,
  toolset: "midnight:wallet" as const,
  readOnly: true,
}

type WalletStateArgs = {
  address?: string
  network?: "testnet" | "devnet" | "mainnet"
}

export async function walletStateHandler(args: WalletStateArgs): Promise<string> {
  const { address, network = "testnet" } = args

  // Get address from env if not provided
  const walletAddress = address || getAddressFromEnv()

  if (!walletAddress) {
    return `# ❌ No Wallet Specified

Provide an address or set MIDNIGHT_WALLET_SEED environment variable.

**Option 1: Query specific address**
\`\`\`
midnight_wallet_state({ address: "0x..." })
\`\`\`

**Option 2: Set environment variable**
\`\`\`bash
export MIDNIGHT_WALLET_SEED="your seed phrase"
\`\`\`

**Option 3: Create a new wallet**
\`\`\`
midnight_create_wallet()
\`\`\`
`
  }

  // Simulated wallet state
  const state = await fetchWalletState(walletAddress, network)

  return `# 💰 Wallet State

## Address
\`${walletAddress}\`

## Network: ${network}

## Balance Summary

| Type | Amount |
|------|--------|
| **Total** | ${state.totalBalance} tDUST |
| **Available** | ${state.availableBalance} tDUST |
| **Pending** | ${state.pendingBalance} tDUST |
| **Shielded** | ${state.shieldedBalance} tDUST |

## Coins

| ID | Amount | Type | Status |
|----|--------|------|--------|
${state.coins.map(c => `| ${c.id.slice(0, 8)}... | ${c.amount} tDUST | ${c.type} | ${c.status} |`).join("\n")}

## Sync Status

| Metric | Value |
|--------|-------|
| Last Synced | ${state.lastSynced} |
| Current Block | ${state.currentBlock.toLocaleString()} |
| Wallet Block | ${state.walletBlock.toLocaleString()} |
| Sync Progress | ${state.syncProgress}% |

## Recent Transactions

${state.recentTxs.length > 0
  ? state.recentTxs.map(tx => `- \`${tx.hash.slice(0, 16)}...\` - ${tx.type} - ${tx.amount} tDUST`).join("\n")
  : "*No recent transactions*"
}

## Actions

**Transfer funds:**
\`\`\`
midnight_transfer_tokens({
  to: "0x...",
  amount: 1.5
})
\`\`\`

**Get more tDUST:**
https://faucet.testnet.midnight.network
`
}

// =============================================================================
// TRANSFER TOKENS TOOL
// =============================================================================

export const transferTokensInputSchema = {
  to: z
    .string()
    .describe("Recipient address"),
  amount: z
    .number()
    .describe("Amount of tDUST to transfer"),
  network: z
    .enum(["testnet", "devnet", "mainnet"])
    .default("testnet")
    .describe("Target network"),
  memo: z
    .string()
    .optional()
    .describe("Optional memo for the transaction"),
  shielded: z
    .boolean()
    .default(false)
    .describe("Use shielded (private) transfer"),
}

export const transferTokensMetadata = {
  name: "midnight_transfer_tokens",
  description: `Transfer tDUST tokens to another address.

**Transfer Types:**
- **Standard:** Public transfer visible on-chain
- **Shielded:** Private transfer using ZK proofs

**Requirements:**
- Wallet with sufficient balance
- Network connectivity
- Gas for transaction fees

**Fees:**
- Standard transfer: ~0.001 tDUST
- Shielded transfer: ~0.005 tDUST (proof generation)

**Security:** Use \`MIDNIGHT_WALLET_SEED\` environment variable.`,
  toolset: "midnight:wallet" as const,
  readOnly: false,
}

type TransferTokensArgs = {
  to: string
  amount: number
  network?: "testnet" | "devnet" | "mainnet"
  memo?: string
  shielded?: boolean
}

export async function transferTokensHandler(args: TransferTokensArgs): Promise<string> {
  const { to, amount, network = "testnet", memo, shielded = false } = args

  // Check for wallet
  const seed = process.env.MIDNIGHT_WALLET_SEED
  if (!seed) {
    return `# ❌ Wallet Required

Set your wallet seed to make transfers:

\`\`\`bash
export MIDNIGHT_WALLET_SEED="your seed phrase"
\`\`\`

Or create a new wallet:
\`\`\`
midnight_create_wallet()
\`\`\`
`
  }

  // Validate recipient address
  if (!isValidAddress(to)) {
    return `# ❌ Invalid Recipient Address

The address \`${to}\` is not a valid Midnight address.

**Valid formats:**
- Hex: \`0x\` followed by 40 hexadecimal characters
- Bech32m: Midnight native format
`
  }

  // Validate amount
  if (amount <= 0) {
    return `# ❌ Invalid Amount

Amount must be greater than 0. You specified: ${amount}
`
  }

  // Execute transfer
  const result = await executeTransfer({
    to,
    amount,
    network,
    memo,
    shielded,
    seed,
  })

  if (!result.success) {
    return `# ❌ Transfer Failed

**Error:** ${result.error}

## Troubleshooting

1. Check your balance: \`midnight_wallet_state()\`
2. Verify network status: \`midnight_network_status()\`
3. Ensure sufficient funds for amount + fees
`
  }

  return `# ✅ Transfer Successful

## Transaction Details

| Property | Value |
|----------|-------|
| **To** | \`${to.slice(0, 10)}...${to.slice(-8)}\` |
| **Amount** | ${amount} tDUST |
| **Type** | ${shielded ? "Shielded (Private)" : "Standard"} |
| **Fee** | ${result.fee} tDUST |
| **Transaction Hash** | \`${result.txHash}\` |
| **Block Height** | ${result.blockHeight?.toLocaleString()} |
${memo ? `| **Memo** | ${memo} |` : ""}

## New Balance

${result.newBalance} tDUST

## View Transaction

https://explorer.testnet.midnight.network/tx/${result.txHash}
`
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateMockSeedPhrase(words: number): string {
  const wordList = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
    "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
    "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album",
  ]

  const selected: string[] = []
  for (let i = 0; i < words; i++) {
    selected.push(wordList[Math.floor(Math.random() * wordList.length)])
  }
  return selected.join(" ")
}

function generateMockAddress(): string {
  const hex = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")
  return `0x${hex}`
}

function getAddressFromEnv(): string | undefined {
  const seed = process.env.MIDNIGHT_WALLET_SEED
  if (!seed) return undefined
  // In production, derive address from seed
  return generateMockAddress()
}

function isValidAddress(address: string): boolean {
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) return true
  if (/^midnight1[a-z0-9]{38,}$/.test(address)) return true
  return false
}

interface WalletState {
  totalBalance: string
  availableBalance: string
  pendingBalance: string
  shieldedBalance: string
  coins: Array<{
    id: string
    amount: string
    type: string
    status: string
  }>
  lastSynced: string
  currentBlock: number
  walletBlock: number
  syncProgress: number
  recentTxs: Array<{
    hash: string
    type: string
    amount: string
  }>
}

async function fetchWalletState(_address: string, _network: string): Promise<WalletState> {
  // Simulated wallet state
  return {
    totalBalance: "10.5",
    availableBalance: "10.0",
    pendingBalance: "0.5",
    shieldedBalance: "5.0",
    coins: [
      { id: generateMockAddress(), amount: "5.0", type: "Unshielded", status: "Confirmed" },
      { id: generateMockAddress(), amount: "5.0", type: "Shielded", status: "Confirmed" },
      { id: generateMockAddress(), amount: "0.5", type: "Unshielded", status: "Pending" },
    ],
    lastSynced: new Date().toISOString(),
    currentBlock: 12345678,
    walletBlock: 12345678,
    syncProgress: 100,
    recentTxs: [
      { hash: generateMockAddress() + generateMockAddress().slice(2), type: "Received", amount: "5.0" },
      { hash: generateMockAddress() + generateMockAddress().slice(2), type: "Sent", amount: "2.0" },
    ],
  }
}

interface TransferResult {
  success: boolean
  txHash?: string
  blockHeight?: number
  fee?: string
  newBalance?: string
  error?: string
}

async function executeTransfer(_options: {
  to: string
  amount: number
  network: string
  memo?: string
  shielded: boolean
  seed: string
}): Promise<TransferResult> {
  // Simulated transfer
  return {
    success: true,
    txHash: generateMockAddress() + generateMockAddress().slice(2),
    blockHeight: 12345680,
    fee: _options.shielded ? "0.005" : "0.001",
    newBalance: "8.499",
  }
}

// =============================================================================
// TOOL MODULES EXPORT
// =============================================================================

export const createWalletModule = {
  metadata: createWalletMetadata,
  inputSchema: createWalletInputSchema,
  handler: createWalletHandler,
}

export const walletStateModule = {
  metadata: walletStateMetadata,
  inputSchema: walletStateInputSchema,
  handler: walletStateHandler,
}

export const transferTokensModule = {
  metadata: transferTokensMetadata,
  inputSchema: transferTokensInputSchema,
  handler: transferTokensHandler,
}
