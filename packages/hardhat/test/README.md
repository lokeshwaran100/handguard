# Handguard Index Fund Tests

This directory contains comprehensive tests for the Handguard Index Fund smart contracts, specifically designed to test functionality with the provided testnet token addresses.

## Test Files

### 1. `TestnetIntegration.test.ts`
- **Purpose**: Comprehensive integration test for all fund functionality
- **Scope**: Full end-to-end testing of fund creation, investment, rebalancing, and redemption
- **Tokens**: Uses the specified testnet token addresses:
  - Token 1: `0x0000000000000000000000000000000000120f46`
  - Token 2: `0x0000000000000000000000000000000000001549`

### 2. `SpecificTokensTest.test.ts`
- **Purpose**: Focused testing with the exact token addresses provided
- **Scope**: Detailed testing of all fund operations with specific token addresses
- **Features**: Enhanced logging, multiple investor scenarios, and comprehensive edge case testing

### 3. `HederaMainnetIntegration.test.ts`
- **Purpose**: Original mainnet integration test (for reference)
- **Scope**: Tests with mainnet token addresses

## Test Configuration

### Testnet Settings
- **Network**: Hedera Testnet (Chain ID: 296)
- **WHBAR**: `0x0000000000000000000000000000000000163b5a`
- **SaucerSwap Router**: `0x00000000000000000000000000000000003c437a`

### Test Token Addresses
The tests are configured to use these specific testnet token addresses:
- **Token 1**: `0x0000000000000000000000000000000000120f46`
- **Token 2**: `0x0000000000000000000000000000000000001549`

## Running the Tests

### Prerequisites
1. Ensure you have a Hedera testnet RPC endpoint configured
2. Make sure test accounts have sufficient HBAR for gas fees
3. Verify the token addresses exist and are tradeable on testnet

### Commands

```bash
# Run all tests
yarn test

# Run specific test file
yarn test test/TestnetIntegration.test.ts
yarn test test/SpecificTokensTest.test.ts

# Run tests with verbose output
yarn test --verbose

# Run tests on specific network (if configured)
yarn test --network hederaTestnet
```

### Test Scenarios Covered

#### 1. Contract Deployment
- ✅ Deploy HGI Token, Oracle, and FundFactory
- ✅ Configure contracts with testnet parameters
- ✅ Verify deployment addresses and configuration

#### 2. Fund Creation
- ✅ Create fund with specific testnet tokens
- ✅ Verify fund properties and token addresses
- ✅ Test fund creation validation and error handling
- ✅ Track creator funds and factory state

#### 3. Investment Operations
- ✅ Buy fund tokens with HBAR
- ✅ Test multiple investors and investment sizes
- ✅ Verify fee distribution (creator, treasury, HGI buyback)
- ✅ Handle investment edge cases and errors

#### 4. Fund Management
- ✅ Rebalance fund proportions
- ✅ Test proportion validation and authorization
- ✅ Verify rebalancing events and state changes
- ✅ Manual rebalance functionality

#### 5. Token Redemption
- ✅ Partial and full token redemption
- ✅ HBAR return calculation and distribution
- ✅ Redemption fee handling
- ✅ Edge cases and error scenarios

#### 6. Value Tracking
- ✅ Fund value calculations (requires oracle prices)
- ✅ Individual token balances
- ✅ Total supply tracking
- ✅ Investor position analytics

#### 7. Administrative Functions
- ✅ Update fund settings (treasury, oracle, DEX)
- ✅ Factory configuration updates
- ✅ Access control verification
- ✅ Address validation

#### 8. Error Handling
- ✅ Invalid parameters and inputs
- ✅ Insufficient balances and allowances
- ✅ Unauthorized access attempts
- ✅ Edge cases and boundary conditions

## Test Output

The tests provide detailed console output including:
- Contract deployment addresses
- Transaction details and gas usage
- Fund metrics and balances
- Event logs and parameter verification
- Step-by-step progress indicators

## Important Notes

### Oracle Configuration
The tests include mock oracle setup. For full functionality on testnet:
1. Deploy actual Chainlink price feeds for the test tokens
2. Configure the oracle with real price feed addresses
3. Ensure price feeds are available and updating

### DEX Integration
The tests assume SaucerSwap integration works on testnet:
1. Verify the router address is correct for testnet
2. Ensure the test tokens have liquidity pools
3. Check that swap operations can execute successfully

### Token Requirements
For the specified token addresses to work:
1. Tokens must exist on Hedera testnet
2. Tokens should be tradeable on SaucerSwap
3. Consider token decimals and precision in calculations

### Gas and Timing
- Tests include increased timeouts for network operations
- Gas estimation may vary on testnet vs mainnet
- Some operations may require multiple blocks to confirm

## Troubleshooting

### Common Issues
1. **RPC Connection**: Ensure testnet RPC endpoint is accessible
2. **Token Addresses**: Verify the provided addresses exist on testnet
3. **Liquidity**: Check that tokens have sufficient liquidity for swaps
4. **Oracle Prices**: Mock prices may be needed if feeds aren't available

### Debug Tips
1. Run tests individually to isolate issues
2. Check console output for detailed transaction information
3. Verify contract addresses after deployment
4. Monitor testnet block explorer for transaction details

## Contributing

When adding new tests:
1. Follow the existing test structure and naming conventions
2. Include comprehensive console logging
3. Test both success and failure scenarios
4. Add appropriate timeouts for network operations
5. Document any new test scenarios or requirements
