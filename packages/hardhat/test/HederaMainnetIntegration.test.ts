import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { HGIToken, ChainlinkOracle, FundFactory, Fund } from "../typechain-types";

describe("Hedera Mainnet Integration Test", function () {
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let treasury: SignerWithAddress;

  let agiToken: HGIToken;
  let oracle: ChainlinkOracle;
  let factory: FundFactory;
  let fund: Fund;

  // Hedera Mainnet addresses
  const WHBAR = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
  const SAUCER_SWAP_ROUTER = "0x00000000000000000000000000000000003c437a";
  const BTC_B = "0x152b9d0FdC40C096757F570A51E494bd4b943E50"; // BTC.b
  const WETH_E = "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"; // WETH.e
  const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
  const USDT_E = "0xc7198437980c041c805A1EDcbA50c1Ce5db95118"; // USDT.e

  // Chainlink Price Feed addresses on Hedera
  const WHBAR_USD_FEED = "0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a";
  const BTC_USD_FEED = "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743";
  const ETH_USD_FEED = "0x976B3D034E162d8bD72D6b9C989d545b839003b0";
  const USDC_USD_FEED = "0xF096872672F44d6EBA71458D74fe67F9a77a23B9";
  const USDT_USD_FEED = "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a";

  before(async function () {
    // This test requires forking Hedera mainnet
    console.log("======== Starting Hedera Mainnet Integration Test ========");

    [deployer, user, treasury] = await ethers.getSigners();

    // Give the user some HBAR for testing
    await deployer.sendTransaction({
      to: user.address,
      value: ethers.parseEther("10"),
    });

    console.log("Test accounts prepared with HBAR");
  });

  describe("1. Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      console.log("\n[1/4] Deploying contracts...");

      // Deploy HGI Token
      const HGITokenFactory = await ethers.getContractFactory("HGIToken");
      agiToken = await HGITokenFactory.deploy(deployer.address);
      await agiToken.waitForDeployment();

      // Deploy Oracle
      const ChainlinkOracleFactory = await ethers.getContractFactory("ChainlinkOracle");
      oracle = await ChainlinkOracleFactory.deploy();
      await oracle.waitForDeployment();

      // Deploy FundFactory
      const FundFactoryFactory = await ethers.getContractFactory("FundFactory");
      factory = await FundFactoryFactory.deploy(
        await agiToken.getAddress(),
        await oracle.getAddress(),
        treasury.address,
        SAUCER_SWAP_ROUTER,
        WHBAR,
        deployer.address,
      );
      await factory.waitForDeployment();

      console.log("  - HGI Token deployed at:", await agiToken.getAddress());
      console.log("  - ChainlinkOracle deployed at:", await oracle.getAddress());
      console.log("  - FundFactory deployed at:", await factory.getAddress());

      // Configure Oracle with price feeds
      await oracle.setPriceFeed(ethers.ZeroAddress, WHBAR_USD_FEED); // HBAR/USD
      await oracle.setPriceFeed(WHBAR, WHBAR_USD_FEED); // WHBAR/USD (same as HBAR)
      await oracle.setPriceFeed(BTC_B, BTC_USD_FEED); // BTC.b/USD
      await oracle.setPriceFeed(WETH_E, ETH_USD_FEED); // WETH.e/USD
      await oracle.setPriceFeed(USDC, USDC_USD_FEED); // USDC/USD
      await oracle.setPriceFeed(USDT_E, USDT_USD_FEED); // USDT.e/USD

      console.log("  - Price feeds configured for HRAR, WHBAR, BTC.b, WETH.e, USDC, and USDT.e");
      console.log("Deployment complete.");

      expect(await agiToken.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await oracle.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await factory.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("2. Fund Creation", function () {
    it("Should create a new fund successfully", async function () {
      console.log("\n[2/4] Creating a new fund...");

      // Mint HGI tokens for fund creation fee
      const creationFee = await factory.creationFee();
      await agiToken.mint(user.address, creationFee);

      // Approve factory to spend HGI
      await agiToken.connect(user).approve(await factory.getAddress(), creationFee);

      console.log("  - Minted and approved HGI for fund creation fee");

      // Define underlying tokens for the fund (4 tokens - excluding WHBAR to avoid DEX conflicts)
      const tokens = [BTC_B, WETH_E, USDC, USDT_E];

      // Create the fund
      const tx = await factory.connect(user).createFund("Test Fund Multi-Asset", "TFMA", tokens);
      await tx.wait();

      console.log("  - createFund transaction completed");

      // Get the new fund's address
      const totalFunds = await factory.getTotalFunds();
      const fundAddress = await factory.funds(totalFunds - 1n);
      fund = await ethers.getContractAt("Fund", fundAddress);

      console.log("  - Fund successfully created at:", fundAddress);
      console.log("Fund creation complete.");

      expect(totalFunds).to.equal(1);
      expect(await fund.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await fund.creator()).to.equal(user.address);
      expect(await fund.fundName()).to.equal("Test Fund Multi-Asset");
      expect(await fund.fundTicker()).to.equal("TFMA");
    });
  });

  describe("3. Buy Fund Tokens", function () {
    it("Should buy fund tokens with HBAR", async function () {
      console.log("\n[3/4] Buying fund tokens...");

      const buyAmount = ethers.parseEther("0.1"); // 0.1 HBAR
      const initialBalance = await fund.balanceOf(user.address);

      // Buy fund tokens
      const tx = await fund.connect(user).buy({ value: buyAmount });
      await tx.wait();

      const finalBalance = await fund.balanceOf(user.address);

      console.log("  - Bought fund tokens with 0.1 HBAR");
      console.log("  - New fund token balance:", ethers.formatEther(finalBalance));
      console.log("Buy complete.");

      expect(finalBalance).to.be.gt(initialBalance);
      expect(finalBalance).to.be.gt(0);

      // Check that the fund has underlying tokens
      const btcbBalance = await fund.getTokenBalance(BTC_B);
      const wetheBalance = await fund.getTokenBalance(WETH_E);
      const usdcBalance = await fund.getTokenBalance(USDC);
      const usdteBalance = await fund.getTokenBalance(USDT_E);

      console.log("  - BTC.b balance in fund:", btcbBalance.toString());
      console.log("  - WETH.e balance in fund:", wetheBalance.toString());
      console.log("  - USDC balance in fund:", usdcBalance.toString());
      console.log("  - USDT.e balance in fund:", usdteBalance.toString());

      expect(btcbBalance).to.be.gt(0);
      expect(wetheBalance).to.be.gt(0);
      expect(usdcBalance).to.be.gt(0);
      expect(usdteBalance).to.be.gt(0);
    });
  });

  describe("4. Rebalance Fund", function () {
    it("Should rebalance fund proportions", async function () {
      console.log("\n[4/4] Rebalancing fund...");

      // Get initial proportions and balances
      const initialBtcbProportion = await fund.targetProportions(BTC_B);
      const initialWetheProportion = await fund.targetProportions(WETH_E);
      const initialUsdcProportion = await fund.targetProportions(USDC);
      const initialUsdteProportion = await fund.targetProportions(USDT_E);

      console.log("  - Initial BTC.b proportion:", initialBtcbProportion.toString());
      console.log("  - Initial WETH.e proportion:", initialWetheProportion.toString());
      console.log("  - Initial USDC proportion:", initialUsdcProportion.toString());
      console.log("  - Initial USDT.e proportion:", initialUsdteProportion.toString());

      // Set new proportions: 40% BTC.b, 30% WETH.e, 20% USDC, 10% USDT.e
      const newTokens = [BTC_B, WETH_E, USDC, USDT_E];
      const newProportions = [40, 30, 20, 10];

      const tx = await fund.connect(user).setProportions(newTokens, newProportions);
      await tx.wait();

      // Get final proportions and balances
      const finalBtcbProportion = await fund.targetProportions(BTC_B);
      const finalWetheProportion = await fund.targetProportions(WETH_E);
      const finalUsdcProportion = await fund.targetProportions(USDC);
      const finalUsdteProportion = await fund.targetProportions(USDT_E);

      console.log("  - Rebalance complete");
      console.log("  - New BTC.b proportion:", finalBtcbProportion.toString());
      console.log("  - New WETH.e proportion:", finalWetheProportion.toString());
      console.log("  - New USDC proportion:", finalUsdcProportion.toString());
      console.log("  - New USDT.e proportion:", finalUsdteProportion.toString());

      expect(finalBtcbProportion).to.equal(40);
      expect(finalWetheProportion).to.equal(30);
      expect(finalUsdcProportion).to.equal(20);
      expect(finalUsdteProportion).to.equal(10);
      expect(finalBtcbProportion).to.not.equal(initialBtcbProportion);
      expect(finalWetheProportion).to.not.equal(initialWetheProportion);
    });
  });

  describe("5. Sell Fund Tokens", function () {
    it("Should sell fund tokens for HBAR", async function () {
      console.log("\n[5/5] Selling fund tokens...");

      const fundTokenBalance = await fund.balanceOf(user.address);
      const initialHbarBalance = await ethers.provider.getBalance(user.address);

      console.log("  - Fund token balance to sell:", ethers.formatEther(fundTokenBalance));

      // Approve fund contract to spend fund tokens
      await fund.connect(user).approve(await fund.getAddress(), fundTokenBalance);

      // Sell all fund tokens
      const tx = await fund.connect(user).sell(fundTokenBalance);
      const receipt = await tx.wait();

      const finalFundTokenBalance = await fund.balanceOf(user.address);
      const finalHbarBalance = await ethers.provider.getBalance(user.address);

      // Calculate gas cost
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const netHbarReceived = finalHbarBalance + gasUsed - initialHbarBalance;

      console.log("  - Sold all fund tokens");
      console.log("  - Final fund token balance:", ethers.formatEther(finalFundTokenBalance));
      console.log("  - Net HBAR received:", ethers.formatEther(netHbarReceived));
      console.log("Sell complete.");

      expect(finalFundTokenBalance).to.equal(0);
      expect(netHbarReceived).to.be.gt(0);
    });
  });

  after(function () {
    console.log("\n======== Hedera Mainnet Integration Test Completed ========");
  });
});
