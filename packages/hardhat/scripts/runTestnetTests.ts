import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Test runner script for Handguard Index Fund testnet tests
 * This script helps run the testnet-specific tests with proper configuration
 */

const TESTNET_CONFIG = {
  // Specific testnet token addresses
  TOKEN_1: "0x0000000000000000000000000000000000120f46",
  TOKEN_2: "0x0000000000000000000000000000000000001549",

  // Hedera testnet addresses
  WHBAR: "0x0000000000000000000000000000000000163b5a",
  SAUCER_SWAP_ROUTER: "0x00000000000000000000000000000000003c437a",

  // Test configuration
  CHAIN_ID: 296,
  NETWORK: "hederaTestnet",
};

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

async function runTest(testFile: string, description: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`\n🧪 Running ${description}...`);
    console.log(`📁 Test file: ${testFile}`);
    console.log(`🔗 Testing with tokens:`);
    console.log(`   Token 1: ${TESTNET_CONFIG.TOKEN_1}`);
    console.log(`   Token 2: ${TESTNET_CONFIG.TOKEN_2}`);
    console.log(`⏳ Starting test execution...\n`);

    const { stdout } = await execAsync(`npx hardhat test ${testFile}`, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large outputs
    });

    const duration = Date.now() - startTime;

    console.log(`✅ ${description} completed successfully!`);
    console.log(`⏱️  Duration: ${duration}ms`);

    return {
      name: description,
      success: true,
      duration,
      output: stdout,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.log(`❌ ${description} failed!`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`💥 Error: ${error.message}`);

    return {
      name: description,
      success: false,
      duration,
      error: error.message,
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log("🚀 Handguard Index Fund Testnet Test Runner");
  console.log("=".repeat(50));
  console.log(`🌐 Target Network: ${TESTNET_CONFIG.NETWORK} (Chain ID: ${TESTNET_CONFIG.CHAIN_ID})`);
  console.log(`🏭 DEX Router: ${TESTNET_CONFIG.SAUCER_SWAP_ROUTER}`);
  console.log(`💰 WHBAR Address: ${TESTNET_CONFIG.WHBAR}`);
  console.log("=".repeat(50));

  const tests = [
    {
      file: "test/TestnetIntegration.test.ts",
      description: "Comprehensive Testnet Integration Test",
    },
    {
      file: "test/SpecificTokensTest.test.ts",
      description: "Specific Tokens Focused Test",
    },
  ];

  const results: TestResult[] = [];

  // Run each test
  for (const test of tests) {
    const result = await runTest(test.file, test.description);
    results.push(result);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));

  let totalDuration = 0;
  let successCount = 0;

  results.forEach((result, index) => {
    const status = result.success ? "✅ PASSED" : "❌ FAILED";
    const duration = `${result.duration}ms`;

    console.log(`${index + 1}. ${result.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Duration: ${duration}`);

    if (result.error) {
      console.log(`   Error: ${result.error.substring(0, 100)}...`);
    }

    console.log("");

    totalDuration += result.duration;
    if (result.success) successCount++;
  });

  console.log(`🎯 Results: ${successCount}/${results.length} tests passed`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`🏷️  Token Addresses Tested:`);
  console.log(`   • ${TESTNET_CONFIG.TOKEN_1}`);
  console.log(`   • ${TESTNET_CONFIG.TOKEN_2}`);

  if (successCount === results.length) {
    console.log("\n🎉 All tests passed! The fund contracts are working correctly with the specified testnet tokens.");
  } else {
    console.log(`\n⚠️  ${results.length - successCount} test(s) failed. Please review the errors above.`);
  }

  console.log("=".repeat(50));
}

// Check if we're running this script directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error("💥 Test runner failed:", error);
      process.exit(1);
    });
}

export { runAllTests, runTest, TESTNET_CONFIG };
