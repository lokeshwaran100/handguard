import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, ethers } from "ethers";

/**
 * Deploys the Handguard Index contracts
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployHandguardIndex: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */

  console.log("🔍 Getting named accounts...");
  const namedAccounts = await hre.getNamedAccounts();
  console.log("📋 Named accounts:", namedAccounts);

  const { deployer } = namedAccounts;

  if (!deployer) {
    throw new Error("Deployer account is undefined. Check your hardhat configuration.");
  }

  console.log("👤 Deployer address:", deployer);

  const { deploy } = hre.deployments;

  console.log("🚀 Deploying Handguard Index contracts...");

  // Network-specific addresses for Hedera Testnet and Mainnet
  // For hardhat fork of mainnet, we should use mainnet addresses
  const isHedera =
    hre.network.name === "hedera" ||
    hre.network.name === "hederaMainnet" ||
    (hre.network.name === "hardhat" && hre.network.config.forking?.enabled) ||
    hre.network.name === "localhost";

  // DEX Router addresses
  const SAUCER_SWAP_TESTNET_ROUTER = "0x2D99ABD9008Dc933ff5c0CD271B88309593aB921"; // Hedera Testnet Saucer Swap Router
  const SAUCER_SWAP_MAINNET_ROUTER = "0x00000000000000000000000000000000003c437a"; // Hedera Mainnet Saucer Swap Router

  // WHBAR addresses
  const WHBAR_TESTNET = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"; // Testnet WHBAR
  const WHBAR_MAINNET = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // Mainnet WHBAR

  // Token addresses for mainnet
  const BTC_B_MAINNET = "0x152b9d0FdC40C096757F570A51E494bd4b943E50"; // BTC.b
  const WETH_E_MAINNET = "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"; // WETH.e
  const USDC_MAINNET = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"; // USDC
  const USDT_E_MAINNET = "0xc7198437980c041c805A1EDcbA50c1Ce5db95118"; // USDT.e

  // Chainlink Price Feed addresses on Hedera
  const HBAR_USD_FEED = "0x0A77230d17318075983913bC2145DB16C7366156"; // Mainnet
  const BTC_USD_FEED = "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743"; // Mainnet
  const ETH_USD_FEED = "0x976B3D034E162d8bD72D6b9C989d545b839003b0"; // Mainnet
  const USDC_USD_FEED = "0xF096872672F44d6EBA71458D74fe67F9a77a23B9"; // Mainnet
  const USDT_USD_FEED = "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a"; // Mainnet

  // Use appropriate addresses based on network
  const DEX_ROUTER = isHedera ? SAUCER_SWAP_MAINNET_ROUTER : SAUCER_SWAP_TESTNET_ROUTER;
  const WHBAR_ADDRESS = isHedera ? WHBAR_MAINNET : WHBAR_TESTNET;

  // Deploy HGI Token
  console.log("📝 Deploying HGI Token...");
  const agiToken = await deploy("HGIToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Deploy Chainlink Oracle (used as price feed source)
  console.log("🔮 Deploying Chainlink Oracle...");
  const chainlinkOracle = await deploy("ChainlinkOracle", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy Fund Factory
  console.log("🏭 Deploying Fund Factory...");
  const fundFactory = await deploy("FundFactory", {
    from: deployer,
    // FundFactory(agi, oracle, treasury, dex, whbar, initialOwner)
    args: [agiToken.address, chainlinkOracle.address, deployer, DEX_ROUTER, WHBAR_ADDRESS, deployer],
    log: true,
    autoMine: true,
  });

  // Configure Chainlink price feeds
  console.log("💰 Configuring Chainlink price feeds...");
  const oracleContract = await hre.ethers.getContract<Contract>("ChainlinkOracle", deployer);

  if (isHedera) {
    // Configure price feeds for Hedera mainnet
    await oracleContract.setPriceFeed(ethers.ZeroAddress, HBAR_USD_FEED); // HBAR/USD
    await oracleContract.setPriceFeed(WHBAR_MAINNET, HBAR_USD_FEED); // WHBAR/USD (same as HBAR)
    await oracleContract.setPriceFeed(BTC_B_MAINNET, BTC_USD_FEED); // BTC.b/USD
    await oracleContract.setPriceFeed(WETH_E_MAINNET, ETH_USD_FEED); // WETH.e/USD
    await oracleContract.setPriceFeed(USDC_MAINNET, USDC_USD_FEED); // USDC/USD
    await oracleContract.setPriceFeed(USDT_E_MAINNET, USDT_USD_FEED); // USDT.e/USD
    console.log("  - Configured price feeds for HBAR, WHBAR, BTC.b, WETH.e, USDC, and USDT.e on Hedera mainnet");
  } else {
    // For Hedera testnet, we could deploy mock price feeds or use existing ones
    console.log("  - ChainlinkOracle deployed on Hedera testnet (price feeds need manual configuration)");
  }

  console.log("✅ Handguard Index contracts deployed successfully!");
  console.log("📊 HGI Token:", agiToken.address);
  console.log("🔮 Chainlink Oracle:", chainlinkOracle.address);
  console.log("🔄 DEX Router:", DEX_ROUTER);
  console.log("🌊 WHBAR:", WHBAR_ADDRESS);
  console.log("🏭 Fund Factory:", fundFactory.address);
  console.log("🌐 Network:", hre.network.name);
  console.log("📋 Deployer:", deployer);
};

export default deployHandguardIndex;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags HandguardIndex
deployHandguardIndex.tags = ["HandguardIndex"];
