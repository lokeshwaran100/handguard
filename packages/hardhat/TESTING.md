# Handguard Index Fund Testing Guide

This guide explains how to run comprehensive tests for the Handguard Index Fund smart contracts using the specific testnet token addresses provided.

## 🎯 Test Overview

The test suite includes comprehensive testing for:
- **Fund Creation**: Creating index funds with specific testnet tokens
- **Investment Operations**: Buying fund tokens with HBAR
- **Rebalancing**: Adjusting token proportions within funds
- **Redemption**: Selling fund tokens back to HBAR
- **Administration**: Managing fund settings and permissions
- **Error Handling**: Testing edge cases and validation

## 📋 Prerequisites

Before running the tests, ensure you have:

1. **Node.js** (v16 or higher) and **Yarn** installed
2. **Hardhat** environment configured
3. Access to **Hedera Testnet** RPC endpoint
4. Test accounts with sufficient **HBAR** for gas fees

## 🧪 Test Files

### Core Test Files

| File | Purpose | Scope |
|------|---------|-------|
| `TestnetIntegration.test.ts` | Comprehensive integration testing | Full end-to-end functionality |
| `SpecificTokensTest.test.ts` | Focused testing with provided tokens | Detailed token-specific scenarios |
| `HederaMainnetIntegration.test.ts` | Reference mainnet tests | Comparison and reference |

### Configuration Files

| File | Purpose |
|------|---------|
| `testnet.config.ts` | Centralized test configuration |
| `test/README.md` | Detailed test documentation |
| `scripts/runTestnetTests.ts` | Automated test runner |

## 🔧 Token Configuration

The tests are configured for these specific testnet token addresses:

```typescript
const TESTNET_TOKENS = {
  TOKEN_1: "0x0000000000000000000000000000000000120f46",
  TOKEN_2: "0x0000000000000000000000000000000000001549"
};
```

## 🚀 Running Tests

### Quick Start Commands

```bash
# Install dependencies
cd packages/hardhat
yarn install

# Run comprehensive testnet integration tests
yarn hardhat test:testnet

# Run specific token focused tests  
yarn hardhat test:specific

# Run all testnet tests with detailed output
yarn hardhat test:all-testnet

# Run individual test files
yarn hardhat test test/TestnetIntegration.test.ts
yarn hardhat test test/SpecificTokensTest.test.ts
```

### Advanced Test Execution

```bash
# Run tests with verbose output
yarn hardhat test test/TestnetIntegration.test.ts --verbose

# Run tests on specific network (if configured in hardhat.config.ts)
yarn hardhat test test/TestnetIntegration.test.ts --network hederaTestnet

# Run tests with gas reporting
REPORT_GAS=true yarn hardhat test test/TestnetIntegration.test.ts

# Run specific test suites
yarn hardhat test --grep "Fund Creation"
yarn hardhat test --grep "Investment Operations"
```

## 📊 Test Scenarios

### 1. Contract Deployment & Configuration
- ✅ Deploy HGI Token, Oracle, and FundFactory contracts
- ✅ Configure contracts with testnet parameters
- ✅ Verify deployment addresses and initial state

### 2. Fund Creation
- ✅ Create index fund with specified testnet tokens
- ✅ Validate fund properties and token addresses
- ✅ Test creation fee payment and HGI token burning
- ✅ Verify fund tracking in factory contract

### 3. Investment Operations
- ✅ Buy fund tokens with HBAR (small, medium, large amounts)
- ✅ Test multiple investors and concurrent investments
- ✅ Verify fee distribution (50% creator, 25% treasury, 25% HGI buyback)
- ✅ Handle investment validation and edge cases

### 4. Fund Management & Rebalancing
- ✅ Update fund token proportions (e.g., 50/50 → 70/30)
- ✅ Execute rebalancing operations
- ✅ Test authorization (only fund creator can rebalance)
- ✅ Validate proportion calculations and constraints

### 5. Token Redemption
- ✅ Partial redemption of fund tokens
- ✅ Full redemption scenarios
- ✅ HBAR return calculation and fee deduction
- ✅ Redemption validation and error handling

### 6. Value Tracking & Analytics
- ✅ Fund value calculations (requires oracle integration)
- ✅ Individual token balance tracking
- ✅ Total supply and investor position analytics
- ✅ Performance metrics and reporting

### 7. Administrative Functions
- ✅ Update fund settings (treasury, oracle, DEX addresses)
- ✅ Factory configuration management
- ✅ Access control verification
- ✅ Address validation and security checks

### 8. Error Handling & Edge Cases
- ✅ Invalid parameters and malformed inputs
- ✅ Insufficient balance scenarios
- ✅ Unauthorized access attempts
- ✅ Boundary condition testing

## 📈 Expected Test Output

The tests provide detailed console output including:

```
======== Specific Tokens Integration Test ========
Testing with token addresses:
Token 1: 0x0000000000000000000000000000000000120f46
Token 2: 0x0000000000000000000000000000000000001549

=== Contract Deployment ===
✓ HGI Token deployed: 0x...
✓ Oracle deployed: 0x...  
✓ FundFactory deployed: 0x...

=== Fund Creation ===
Creating fund with tokens:
- Token 1: 0x0000000000000000000000000000000000120f46
- Token 2: 0x0000000000000000000000000000000000001549
✓ Fund creation transaction completed
✓ Fund deployed at: 0x...

[... detailed test execution logs ...]

✅ All tests completed successfully!
```

## ⚙️ Configuration Customization

### Modifying Test Parameters

Edit `test/testnet.config.ts` to customize:

```typescript
export const TESTNET_CONFIG = {
  TOKENS: {
    TOKEN_1: "0x0000000000000000000000000000000000120f46", // Your token 1
    TOKEN_2: "0x0000000000000000000000000000000000001549", // Your token 2
  },
  
  TEST_PARAMS: {
    FUND_CREATION_FEE: "1000", // HGI tokens required
    INITIAL_HBAR_FUNDING: "100", // HBAR per test account
    MEDIUM_INVESTMENT: "5", // Default investment amount
  },
  
  FUND_CONFIG: {
    NAME: "Your Fund Name",
    TICKER: "YFN",
    INITIAL_PROPORTIONS: [50, 50], // Equal split
  }
};
```

### Network Configuration

Update `hardhat.config.ts` for testnet connectivity:

```typescript
networks: {
  hederaTestnet: {
    url: "https://testnet.hashio.io/api", // Your testnet RPC
    accounts: [process.env.PRIVATE_KEY], // Your test account
    chainId: 296,
  }
}
```

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **RPC Connection Failed** | Verify testnet RPC endpoint and network connectivity |
| **Insufficient HBAR** | Fund test accounts with sufficient HBAR for gas fees |
| **Token Not Found** | Verify token addresses exist on Hedera testnet |
| **Swap Failures** | Check token liquidity on SaucerSwap testnet |
| **Oracle Errors** | Configure mock prices or actual price feeds |

### Debug Tips

1. **Run tests individually** to isolate issues:
   ```bash
   yarn hardhat test --grep "Fund Creation"
   ```

2. **Check transaction details** on Hedera testnet explorer

3. **Verify contract deployments** and addresses in test output

4. **Monitor console logs** for detailed execution information

### Environment Variables

Set these environment variables for enhanced testing:

```bash
# .env file
PRIVATE_KEY=your_test_account_private_key
HEDERA_TESTNET_RPC=https://testnet.hashio.io/api
REPORT_GAS=true
DEBUG=true
```

## 📚 Additional Resources

- **Hedera Documentation**: [docs.hedera.com](https://docs.hedera.com)
- **SaucerSwap Docs**: [docs.saucerswap.finance](https://docs.saucerswap.finance)
- **Hardhat Testing**: [hardhat.org/tutorial/testing-contracts](https://hardhat.org/tutorial/testing-contracts.html)

## 🤝 Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Include comprehensive logging and assertions
3. Test both success and failure scenarios
4. Update documentation and configuration as needed
5. Ensure tests are deterministic and reliable

## 📞 Support

If you encounter issues with the tests:

1. Check the troubleshooting section above
2. Review test logs for specific error messages
3. Verify your testnet configuration and connectivity
4. Ensure token addresses are valid and tradeable

---

**Happy Testing! 🧪✨**
