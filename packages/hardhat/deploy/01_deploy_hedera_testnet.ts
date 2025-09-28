import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys contracts to Hedera testnet with mock tokens for testing
 */
const deployHederaTestnet: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const chainId = await hre.getChainId();

  console.log("Deploying to Hedera testnet...");
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer);

  // Only deploy on Hedera testnet (chainId 296) or hardhat fork
  if (chainId !== "296" && chainId !== "31337") {
    console.log("Skipping Hedera testnet deployment - not on testnet");
    return;
  }

  // Deploy HGI Token
  const hgiToken = await deploy("HGIToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Deploy Oracle
  const oracle = await deploy("ChainlinkOracle", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy FundFactory
  const fundFactory = await deploy("FundFactory", {
    from: deployer,
    args: [
      hgiToken.address,
      oracle.address,
      deployer, // treasury
      "0x0000000000000000000000000000000000159398", // dex
      "0x0000000000000000000000000000000000003ad2", // whbar
      deployer, // admin
    ],
    log: true,
    autoMine: true,
  });

  // Configure oracle with mock price feeds (using zero addresses for now)
  console.log("Configuring oracle with mock price feeds...");
  const oracleContract = await ethers.getContractAt("ChainlinkOracle", oracle.address);

  // Set mock prices (these would normally be Chainlink feeds)
  await oracleContract.setPriceFeed(ethers.ZeroAddress, ethers.ZeroAddress); // HBAR/USD
  await oracleContract.setPriceFeed(
    "0x0000000000000000000000000000000000003ad2",
    "0x0000000000000000000000000000000000003ad2",
  ); // WHBAR/USD
  await oracleContract.setPriceFeed(
    "0x0000000000000000000000000000000000120f46",
    "0x0000000000000000000000000000000000120f46",
  ); // WHBAR/USD
  await oracleContract.setPriceFeed(
    "0x0000000000000000000000000000000000001549",
    "0x0000000000000000000000000000000000001549",
  ); // WHBAR/USD
  //   await oracleContract.setPriceFeed(mockBTC.address, ethers.ZeroAddress); // BTC/USD
  //   await oracleContract.setPriceFeed(mockETH.address, ethers.ZeroAddress); // ETH/USD
  //   await oracleContract.setPriceFeed(mockUSDC.address, ethers.ZeroAddress); // USDC/USD
  //   await oracleContract.setPriceFeed(mockUSDT.address, ethers.ZeroAddress); // USDT/USD

  console.log("\n=== Hedera Testnet Deployment Complete ===");
  console.log("HGI Token:", hgiToken.address);
  console.log("Oracle:", oracle.address);
  console.log("FundFactory:", fundFactory.address);
  //   console.log("Mock WHBAR:", mockWHBAR.address);
  //   console.log("Mock BTC:", mockBTC.address);
  //   console.log("Mock ETH:", mockETH.address);
  //   console.log("Mock USDC:", mockUSDC.address);
  //   console.log("Mock USDT:", mockUSDT.address);
  //   console.log("Mock Router:", mockRouter.address);
  console.log("==========================================");
};

export default deployHederaTestnet;
deployHederaTestnet.tags = ["HederaTestnet"];
