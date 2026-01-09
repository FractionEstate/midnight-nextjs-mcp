/**
 * Compact Standard Library Resource
 *
 * MCP resource providing documentation for the Compact standard library.
 */

export const metadata = {
  uri: "midnight://compact/stdlib",
  name: "Compact Standard Library Reference",
  description: "Complete reference for the Compact standard library including data structures, cryptographic primitives, and utility functions.",
  mimeType: "text/markdown",
}

export const content = `# Compact Standard Library Reference

The Compact standard library provides essential types, data structures, and functions for building privacy-preserving smart contracts on Midnight.

## Core Types

### Primitives

| Type | Description | Example |
|------|-------------|---------|
| \`Boolean\` | True/false values | \`true\`, \`false\` |
| \`Field\` | Finite field element (ZK native) | \`Field(42)\` |
| \`Unsigned Integer\` | Non-negative integers | \`Uint<8>\`, \`Uint<32>\`, \`Uint<64>\` |
| \`Bytes\` | Fixed-size byte arrays | \`Bytes<32>\` |
| \`Vector\` | Dynamic-size arrays | \`Vector<Field>\` |
| \`Option\` | Optional values | \`Option<Field>\` |

### Address Types

\`\`\`compact
// Contract address
type Address = Bytes<32>

// Public key for signatures
type PublicKey = Bytes<32>

// Hash output
type Hash = Bytes<32>
\`\`\`

## Data Structures

### Counter
Atomic counter with increment/decrement operations.

\`\`\`compact
import Counter from "std/counter";

ledger {
  votes: Counter;
}

circuit vote(): [] {
  ledger.votes.increment(1);
}
\`\`\`

### Map
Key-value storage with privacy support.

\`\`\`compact
import Map from "std/map";

ledger {
  balances: Map<Address, Uint<64>>;
}

circuit transfer(to: Address, amount: Uint<64>): [] {
  const sender = context.caller();
  ledger.balances.update(sender, |bal| bal - amount);
  ledger.balances.update(to, |bal| bal + amount);
}
\`\`\`

### Set
Collection of unique elements.

\`\`\`compact
import Set from "std/set";

ledger {
  voters: Set<Address>;
}

circuit register(): [] {
  const voter = context.caller();
  ledger.voters.insert(voter);
}
\`\`\`

### MerkleTree
Privacy-preserving membership proofs.

\`\`\`compact
import MerkleTree from "std/merkle";

ledger {
  commitments: MerkleTree<Hash>;
}

circuit addCommitment(commitment: Hash): [] {
  ledger.commitments.insert(commitment);
}

witness proveInclusion(
  commitment: Hash,
  proof: MerkleProof
): Boolean {
  return ledger.commitments.verify(commitment, proof);
}
\`\`\`

## Cryptographic Primitives

### Hash Functions

\`\`\`compact
import { hash, hashPair } from "std/crypto";

// Hash a single value
const h: Hash = hash(data);

// Hash two values together
const h2: Hash = hashPair(left, right);
\`\`\`

### Commitments

\`\`\`compact
import { commit, openCommitment } from "std/commitment";

// Create a Pedersen commitment
const commitment = commit(value, randomness);

// Verify commitment opening
const valid = openCommitment(commitment, value, randomness);
\`\`\`

### Signatures

\`\`\`compact
import { verify } from "std/signature";

// Verify Ed25519 signature
const isValid: Boolean = verify(publicKey, message, signature);
\`\`\`

## Token Operations

### CoinInfo
Standard token balance tracking.

\`\`\`compact
import CoinInfo from "std/coin";

ledger {
  balance: CoinInfo;
}

circuit deposit(amount: Uint<64>): [] {
  ledger.balance.credit(amount);
}

circuit withdraw(amount: Uint<64>): [] {
  ledger.balance.debit(amount);
}
\`\`\`

### QualifiedCoinInfo
Enhanced token with metadata.

\`\`\`compact
import QualifiedCoinInfo from "std/coin";

ledger {
  tokens: QualifiedCoinInfo;
}
\`\`\`

## Context Access

Access runtime context within circuits:

\`\`\`compact
circuit example(): [] {
  // Get caller address
  const caller = context.caller();

  // Get current block height
  const height = context.blockHeight();

  // Get transaction hash
  const txHash = context.txHash();

  // Get contract address
  const self = context.address();
}
\`\`\`

## Privacy Patterns

### Private Witnesses

\`\`\`compact
// Private input not visible on-chain
witness getSecretValue(): Field {
  return privateState.secret;
}

circuit proveKnowledge(): [] {
  const secret = getSecretValue();
  // Use secret in ZK computation
  assert(hash(secret) == ledger.commitment);
}
\`\`\`

### Shielded Transfers

\`\`\`compact
import { shield, unshield } from "std/shielded";

circuit shieldTokens(amount: Uint<64>): [] {
  shield(context.caller(), amount);
}

circuit unshieldTokens(
  amount: Uint<64>,
  proof: ShieldProof
): [] {
  unshield(context.caller(), amount, proof);
}
\`\`\`

## Assertions and Errors

\`\`\`compact
circuit requireOwner(): [] {
  assert(context.caller() == ledger.owner, "Not owner");
}

circuit safeTransfer(amount: Uint<64>): [] {
  require(amount > 0, "Amount must be positive");
  require(ledger.balance >= amount, "Insufficient balance");
  // ...
}
\`\`\`

## Best Practices

1. **Use the right integer size** - \`Uint<64>\` for balances, \`Uint<8>\` for small values
2. **Prefer Set over Map** when only tracking membership
3. **Use MerkleTree for large sets** - O(log n) proofs vs O(n) iteration
4. **Keep witnesses minimal** - Only include data needed for proofs
5. **Validate all inputs** - Use \`assert\`/\`require\` for safety

## Further Reading

- [Compact Language Reference](midnight://compact/reference)
- [Writing Compact Contracts](https://docs.midnight.network/compact/writing)
- [Midnight SDK Guide](midnight://sdk/overview)
`

export async function handler(): Promise<string> {
  return content
}
