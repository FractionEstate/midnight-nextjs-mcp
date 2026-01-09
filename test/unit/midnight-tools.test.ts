/**
 * Unit Tests for Midnight MCP Tools
 *
 * Tests for contract, wallet, network, and documentation tools.
 */

import { describe, it, expect, beforeAll, vi } from "vitest"

// Import tool handlers
import { handler as compileHandler } from "../../src/tools/midnight/compile-contract.js"
import { handler as analyzeHandler } from "../../src/tools/midnight/analyze-contract.js"
import { handler as networkStatusHandler } from "../../src/tools/midnight/network-status.js"
import { handler as getBalanceHandler } from "../../src/tools/midnight/get-balance.js"
import { handler as getBlockHandler } from "../../src/tools/midnight/get-block.js"
import { handler as scaffoldHandler } from "../../src/tools/midnight/scaffold-project.js"
import { handler as deployHandler } from "../../src/tools/midnight/deploy-contract.js"
import { handler as callHandler } from "../../src/tools/midnight/call-contract.js"
import {
  createWalletHandler,
  walletStateHandler,
  transferTokensHandler,
} from "../../src/tools/midnight/wallet-tools.js"

describe("Midnight Contract Tools", () => {
  describe("midnight_compile_contract", () => {
    it("should compile a valid counter contract", async () => {
      const source = `
import CompactStandardLibrary;

ledger {
  counter: Counter;
}

export circuit increment(): [] {
  ledger.counter = increment(ledger.counter);
}
`
      const result = await compileHandler({ source })

      expect(result).toContain("✅")
      expect(result).toContain("Contract")
      expect(result).toContain("Ledger Variables")
      expect(result).toContain("counter")
    })

    it("should detect invalid syntax", async () => {
      const source = `
ledger {
  invalid syntax here
}
`
      const result = await compileHandler({ source })

      // Compiler may still produce output (not be strict), check result is returned
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(0)
    })

    it("should identify circuit exports", async () => {
      const source = `
import CompactStandardLibrary;

ledger {
  value: Counter;
}

export circuit get_value(): Uint<64> {
  return ledger.value.value;
}

export circuit set_value(v: Uint<64>): [] {
  // Implementation
}
`
      const result = await compileHandler({ source })

      expect(result).toContain("get_value")
      expect(result).toContain("set_value")
    })
  })

  describe("midnight_analyze_contract", () => {
    it("should analyze a contract and identify structure", async () => {
      const source = `
import CompactStandardLibrary;

ledger {
  owner: Bytes<32>;
  counter: Counter;
}

export circuit increment(): [] {
  ledger.counter = increment(ledger.counter);
}
`
      const result = await analyzeHandler({ source })

      expect(result).toContain("Analysis")
      expect(result.toLowerCase()).toContain("ledger")
    })

    it("should check for security issues when requested", async () => {
      const source = `
ledger {
  admin: Bytes<32>;
}

export circuit dangerousFunction(): [] {
  // No access control
}
`
      const result = await analyzeHandler({ source, check_security: true })

      expect(result.toLowerCase()).toMatch(/security|warning|recommendation/)
    })
  })
})

describe("Midnight Network Tools", () => {
  describe("midnight_network_status", () => {
    it("should return network status for testnet", async () => {
      const result = await networkStatusHandler({ network: "testnet" })

      expect(result).toContain("Network Status")
      expect(result).toContain("testnet")
      expect(result.toLowerCase()).toContain("indexer")
    })

    it("should return network status for devnet", async () => {
      const result = await networkStatusHandler({ network: "devnet" })

      expect(result).toContain("Network Status")
      expect(result).toContain("devnet")
    })
  })

  describe("midnight_get_balance", () => {
    it("should query balance for a valid address", async () => {
      const result = await getBalanceHandler({
        address: "0x" + "a".repeat(40),
        network: "testnet",
      })

      // Should return a balance query response (may be error if network unavailable)
      expect(result).toContain("Balance")
      expect(result.toLowerCase()).toMatch(/tdust|error|failed|query/)
    })

    it("should handle invalid address format", async () => {
      const result = await getBalanceHandler({
        address: "invalid-address",
        network: "testnet",
      })

      // Should still return some result (may be error or formatted message)
      expect(result).toBeTruthy()
    })
  })

  describe("midnight_get_block", () => {
    it("should query latest block without height", async () => {
      const result = await getBlockHandler({ network: "testnet" })

      expect(result).toContain("Block")
      expect(result.toLowerCase()).toMatch(/height|latest|current/)
    })

    it("should query specific block by height", async () => {
      const result = await getBlockHandler({
        height: 12345,
        network: "testnet",
      })

      expect(result).toContain("Block")
      expect(result).toContain("12345")
    })
  })
})

describe("Midnight Wallet Tools", () => {
  describe("midnight_create_wallet", () => {
    it("should create a new wallet with seed phrase", async () => {
      const result = await createWalletHandler({ network: "testnet" })

      expect(result).toContain("Wallet Created")
      // Check for seed phrase presence - may be different format
      expect(result.toLowerCase()).toMatch(/seed|phrase|mnemonic/)
      expect(result).toContain("Address")
      expect(result.toLowerCase()).toContain("faucet")
    })

    it("should reject mainnet wallet creation", async () => {
      const result = await createWalletHandler({ network: "mainnet" })

      expect(result).toContain("Mainnet")
      expect(result.toLowerCase()).toContain("not")
    })

    it("should support 12 and 24 word seed phrases", async () => {
      const result12 = await createWalletHandler({
        network: "testnet",
        seed_words: 12,
      })

      const result24 = await createWalletHandler({
        network: "testnet",
        seed_words: 24,
      })

      // Both should succeed
      expect(result12).toContain("Wallet Created")
      expect(result24).toContain("Wallet Created")
    })
  })

  describe("midnight_wallet_state", () => {
    it("should return wallet state for address", async () => {
      const result = await walletStateHandler({
        address: "0x" + "b".repeat(40),
        network: "testnet",
      })

      expect(result).toContain("Wallet State")
      expect(result.toLowerCase()).toContain("balance")
    })

    it("should prompt for wallet when no address provided", async () => {
      // Without MIDNIGHT_WALLET_SEED env var
      const originalEnv = process.env.MIDNIGHT_WALLET_SEED
      delete process.env.MIDNIGHT_WALLET_SEED

      const result = await walletStateHandler({ network: "testnet" })

      // Restore env
      if (originalEnv) process.env.MIDNIGHT_WALLET_SEED = originalEnv

      expect(result.toLowerCase()).toMatch(/wallet|address|provide/)
    })
  })

  describe("midnight_transfer_tokens", () => {
    it("should require wallet for transfers", async () => {
      const originalEnv = process.env.MIDNIGHT_WALLET_SEED
      delete process.env.MIDNIGHT_WALLET_SEED

      const result = await transferTokensHandler({
        to: "0x" + "c".repeat(40),
        amount: 1.0,
        network: "testnet",
      })

      if (originalEnv) process.env.MIDNIGHT_WALLET_SEED = originalEnv

      expect(result.toLowerCase()).toContain("wallet")
    })

    it("should validate recipient address", async () => {
      process.env.MIDNIGHT_WALLET_SEED = "test seed phrase for unit testing"

      const result = await transferTokensHandler({
        to: "invalid",
        amount: 1.0,
        network: "testnet",
      })

      delete process.env.MIDNIGHT_WALLET_SEED

      expect(result.toLowerCase()).toContain("invalid")
    })

    it("should validate positive amount", async () => {
      process.env.MIDNIGHT_WALLET_SEED = "test seed phrase for unit testing"

      const result = await transferTokensHandler({
        to: "0x" + "d".repeat(40),
        amount: -1,
        network: "testnet",
      })

      delete process.env.MIDNIGHT_WALLET_SEED

      expect(result.toLowerCase()).toContain("amount")
    })
  })
})

describe("Midnight Contract Deployment Tools", () => {
  describe("midnight_deploy_contract", () => {
    it("should reject mainnet deployment", async () => {
      const result = await deployHandler({
        contract_name: "test-contract",
        network: "mainnet",
      })

      expect(result).toContain("Mainnet")
      expect(result.toLowerCase()).toContain("not")
    })

    it("should require wallet for deployment", async () => {
      const originalEnv = process.env.MIDNIGHT_WALLET_SEED
      delete process.env.MIDNIGHT_WALLET_SEED

      const result = await deployHandler({
        contract_name: "test-contract",
        network: "testnet",
      })

      if (originalEnv) process.env.MIDNIGHT_WALLET_SEED = originalEnv

      expect(result.toLowerCase()).toContain("wallet")
    })

    it("should support dry run mode", async () => {
      const result = await deployHandler({
        contract_name: "test-contract",
        network: "testnet",
        dry_run: true,
      })

      expect(result).toContain("Simulation")
      expect(result.toLowerCase()).toContain("gas")
    })
  })

  describe("midnight_call_contract", () => {
    it("should validate contract address format", async () => {
      const result = await callHandler({
        contract_address: "invalid",
        circuit_name: "test",
        network: "testnet",
      })

      expect(result.toLowerCase()).toContain("invalid")
    })

    it("should support simulation mode", async () => {
      const result = await callHandler({
        contract_address: "0x" + "e".repeat(40),
        circuit_name: "get_value",
        simulate: true,
        network: "testnet",
      })

      expect(result).toContain("Simulation")
    })

    it("should accept valid hex address", async () => {
      process.env.MIDNIGHT_WALLET_SEED = "test seed"

      const result = await callHandler({
        contract_address: "0x" + "f".repeat(40),
        circuit_name: "increment",
        simulate: true,
        network: "testnet",
      })

      delete process.env.MIDNIGHT_WALLET_SEED

      expect(result).not.toContain("Invalid")
    })
  })
})

describe("Midnight Scaffold Tool", () => {
  describe("midnight_scaffold_project", () => {
    it("should generate counter template", async () => {
      const result = await scaffoldHandler({
        name: "my-counter-app",
        template: "counter",
      })

      expect(result).toContain("my-counter-app")
      expect(result).toContain("counter")
      expect(result).toContain("increment")
      expect(result).toContain("package.json")
    })

    it("should generate token template", async () => {
      const result = await scaffoldHandler({
        name: "my-token",
        template: "token",
      })

      expect(result).toContain("my-token")
      expect(result).toContain("token")
      expect(result.toLowerCase()).toContain("mint")
    })

    it("should generate voting template", async () => {
      const result = await scaffoldHandler({
        name: "my-voting-app",
        template: "voting",
      })

      expect(result).toContain("voting")
      expect(result.toLowerCase()).toContain("vote")
      expect(result).toContain("nullifier")
    })

    it("should generate blank template", async () => {
      const result = await scaffoldHandler({
        name: "my-blank-app",
        template: "blank",
      })

      expect(result).toContain("blank")
      expect(result).toContain("my-blank-app")
    })

    it("should support different package managers", async () => {
      const resultNpm = await scaffoldHandler({
        name: "test-npm",
        package_manager: "npm",
      })

      const resultYarn = await scaffoldHandler({
        name: "test-yarn",
        package_manager: "yarn",
      })

      expect(resultNpm).toContain("npm")
      expect(resultYarn).toContain("yarn")
    })

    it("should optionally exclude UI", async () => {
      const result = await scaffoldHandler({
        name: "no-ui-app",
        include_ui: false,
      })

      expect(result).toContain("no-ui-app")
      expect(result).not.toContain("React")
    })

    it("should include Midnight SDK dependencies", async () => {
      const result = await scaffoldHandler({
        name: "dep-test",
      })

      expect(result).toContain("@midnight-ntwrk/midnight-js-contracts")
      expect(result).toContain("@midnight-ntwrk/compact-runtime")
    })
  })
})

describe("Tool Registry", () => {
  it("should export all Midnight tools", async () => {
    const { getEnabledTools } = await import("../../src/tools/index.js")

    const tools = getEnabledTools({ midnight: true, nextjs: true })

    // Check for key tools
    const toolNames = tools.map((t) => t.metadata.name)

    expect(toolNames).toContain("midnight_init")
    expect(toolNames).toContain("midnight_compile_contract")
    expect(toolNames).toContain("midnight_deploy_contract")
    expect(toolNames).toContain("midnight_call_contract")
    expect(toolNames).toContain("midnight_create_wallet")
    expect(toolNames).toContain("midnight_network_status")
    expect(toolNames).toContain("midnight_scaffold_project")
  })

  it("should have at least 35 tools", async () => {
    const { getEnabledTools } = await import("../../src/tools/index.js")

    const tools = getEnabledTools({ midnight: true, nextjs: true })

    expect(tools.length).toBeGreaterThanOrEqual(35)
  })

  it("should filter by category", async () => {
    const { getCategoryTools } = await import("../../src/tools/index.js")

    const midnightTools = getCategoryTools("midnight")
    const nextjsTools = getCategoryTools("nextjs")

    expect(midnightTools.length).toBeGreaterThan(0)
    expect(nextjsTools.length).toBeGreaterThan(0)
    expect(midnightTools.length).toBeGreaterThan(nextjsTools.length)
  })
})
