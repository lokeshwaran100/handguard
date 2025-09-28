/**
 * Testnet Configuration for Handguard Index Fund Tests
 *
 * This file contains all the testnet-specific addresses and configuration
 * that can be easily modified for different testing scenarios.
 */

export const TESTNET_CONFIG = {
  // Specific testnet token addresses (as provided)
  TOKENS: {
    TOKEN_1: "0x0000000000000000000000000000000000120f46",
    TOKEN_2: "0x0000000000000000000000000000000000001549",
  },

  // Hedera Testnet Infrastructure
  HEDERA: {
    CHAIN_ID: 296,
    NETWORK_NAME: "hederaTestnet",
    WHBAR: "0x0000000000000000000000000000000000163b5a",
    SAUCER_SWAP_ROUTER: "0x00000000000000000000000000000000003c437a",
  },

  // Test Parameters
  TEST_PARAMS: {
    FUND_CREATION_FEE: "1000", // 1000 HGI tokens (in ether units)
    INITIAL_HBAR_FUNDING: "100", // 100 HBAR per test account (in ether units)
    SMALL_INVESTMENT: "0.1", // 0.1 HBAR (in ether units)
    MEDIUM_INVESTMENT: "5", // 5 HBAR (in ether units)
    LARGE_INVESTMENT: "20", // 20 HBAR (in ether units)
  },

  // Fund Configuration
  FUND_CONFIG: {
    NAME: "Testnet Dual Token Index",
    TICKER: "TDTI",
    INITIAL_PROPORTIONS: [50, 50], // Equal 50/50 split initially
    REBALANCED_PROPORTIONS: [70, 30], // 70/30 split for rebalancing tests
  },

  // Mock Oracle Prices (USD with 8 decimals)
  MOCK_PRICES: {
    HBAR_USD: 8000000, // $0.08 USD
    TOKEN_1_USD: 100000000, // $1.00 USD
    TOKEN_2_USD: 250000000, // $2.50 USD
  },

  // Test Timeouts and Limits
  TIMEOUTS: {
    TRANSACTION: 60000, // 60 seconds
    TEST_SUITE: 300000, // 5 minutes
    NETWORK_OPERATION: 30000, // 30 seconds
  },

  // Gas and Fee Settings
  GAS_CONFIG: {
    GAS_LIMIT: 8000000,
    GAS_PRICE: "20000000000", // 20 gwei
    MAX_FEE_PER_GAS: "50000000000", // 50 gwei
    MAX_PRIORITY_FEE_PER_GAS: "2000000000", // 2 gwei
  },
};

/**
 * Utility functions for test configuration
 */
export const TestUtils = {
  /**
   * Get token addresses as array
   */
  getTokenAddresses(): string[] {
    return [TESTNET_CONFIG.TOKENS.TOKEN_1, TESTNET_CONFIG.TOKENS.TOKEN_2];
  },

  /**
   * Get fund creation fee in wei
   */
  getFundCreationFeeWei(): bigint {
    return BigInt(TESTNET_CONFIG.TEST_PARAMS.FUND_CREATION_FEE) * BigInt(10 ** 18);
  },

  /**
   * Get HBAR amount in wei
   */
  getHbarAmountWei(amount: string): bigint {
    return BigInt(amount) * BigInt(10 ** 18);
  },

  /**
   * Validate token addresses
   */
  validateTokenAddresses(): boolean {
    const { TOKEN_1, TOKEN_2 } = TESTNET_CONFIG.TOKENS;

    // Check if addresses are valid Ethereum addresses
    const isValidAddress = (address: string): boolean => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    return isValidAddress(TOKEN_1) && isValidAddress(TOKEN_2) && TOKEN_1 !== TOKEN_2;
  },

  /**
   * Get test account funding amount
   */
  getTestAccountFunding(): bigint {
    return BigInt(TESTNET_CONFIG.TEST_PARAMS.INITIAL_HBAR_FUNDING) * BigInt(10 ** 18);
  },

  /**
   * Get investment amounts for testing
   */
  getInvestmentAmounts(): {
    small: bigint;
    medium: bigint;
    large: bigint;
  } {
    return {
      small: BigInt(TESTNET_CONFIG.TEST_PARAMS.SMALL_INVESTMENT) * BigInt(10 ** 18),
      medium: BigInt(TESTNET_CONFIG.TEST_PARAMS.MEDIUM_INVESTMENT) * BigInt(10 ** 18),
      large: BigInt(TESTNET_CONFIG.TEST_PARAMS.LARGE_INVESTMENT) * BigInt(10 ** 18),
    };
  },
};

/**
 * Validation function to ensure configuration is correct
 */
export function validateTestnetConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate token addresses
  if (!TestUtils.validateTokenAddresses()) {
    errors.push("Invalid token addresses provided");
  }

  // Validate Hedera addresses
  if (!/^0x[a-fA-F0-9]{40}$/.test(TESTNET_CONFIG.HEDERA.WHBAR)) {
    errors.push("Invalid WHBAR address");
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(TESTNET_CONFIG.HEDERA.SAUCER_SWAP_ROUTER)) {
    errors.push("Invalid SaucerSwap router address");
  }

  // Validate proportions
  const initialSum = TESTNET_CONFIG.FUND_CONFIG.INITIAL_PROPORTIONS.reduce((a, b) => a + b, 0);
  if (initialSum !== 100) {
    errors.push("Initial proportions must sum to 100");
  }

  const rebalancedSum = TESTNET_CONFIG.FUND_CONFIG.REBALANCED_PROPORTIONS.reduce((a, b) => a + b, 0);
  if (rebalancedSum !== 100) {
    errors.push("Rebalanced proportions must sum to 100");
  }

  // Validate numeric values
  try {
    TestUtils.getFundCreationFeeWei();
    TestUtils.getTestAccountFunding();
    TestUtils.getInvestmentAmounts();
  } catch {
    errors.push("Invalid numeric configuration values");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate configuration on import
const validation = validateTestnetConfig();
if (!validation.valid) {
  console.warn("⚠️  Testnet configuration validation failed:");
  validation.errors.forEach(error => console.warn(`   - ${error}`));
}

export default TESTNET_CONFIG;
