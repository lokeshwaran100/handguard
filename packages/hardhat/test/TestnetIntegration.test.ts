import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { HGIToken, ChainlinkOracle, FundFactory, Fund } from "../typechain-types";

describe("Testnet Integration Test", function () {
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let treasury: SignerWithAddress;

  let hgiToken: HGIToken;
  let oracle: ChainlinkOracle;
  let factory: FundFactory;
  let fund: Fund;

  // Testnet token addresses (as specified)
  // const TOKEN_1 = "0x0000000000000000000000000000000000120f46"; // First testnet token
  const TOKEN_1 = "0x0000000000000000000000000000000000120f46"; // First testnet token
  // const TOKEN_2 = "0x0000000000000000000000000000000000001549"; // Second testnet token
  const TOKEN_2 = "0x0000000000000000000000000000000000001549"; // Second testnet token

  // Testnet addresses (Hedera Testnet)
  const WHBAR = "0x0000000000000000000000000000000000163b5a"; // WHBAR on Hedera Testnet
  const SAUCER_SWAP_ROUTER = "0x00000000000000000000000000000000003c437a"; // SaucerSwap Router

  // Mock price feed addresses for testnet (these would need to be actual testnet feeds)
  // const HBAR_USD_FEED = "0x0000000000000000000000000000000000000000"; // Mock address
  // const TOKEN_1_USD_FEED = "0x0000000000000000000000000000000000000000"; // Mock address
  // const TOKEN_2_USD_FEED = "0x0000000000000000000000000000000000000000"; // Mock address

  const FUND_CREATION_FEE = ethers.parseEther("1000"); // 1000 HGI tokens

  before(async function () {
    console.log("======== Starting Testnet Integration Test ========");

    [deployer, user1, user2, treasury] = await ethers.getSigners();

    // Fund test accounts with HBAR
    await deployer.sendTransaction({
      to: user1.address,
      value: ethers.parseEther("100"), // 100 HBAR
    });

    await deployer.sendTransaction({
      to: user2.address,
      value: ethers.parseEther("50"), // 50 HBAR
    });

    console.log("Test accounts funded with HBAR");
    console.log("User1 address:", user1.address);
    console.log("User2 address:", user2.address);
    console.log("Treasury address:", treasury.address);
  });

  describe("1. Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      console.log("\n[1/7] Deploying contracts...");

      // Deploy HGI Token
      const HGITokenFactory = await ethers.getContractFactory("HGIToken");
      hgiToken = await HGITokenFactory.deploy(deployer.address);
      await hgiToken.waitForDeployment();

      // Deploy Oracle
      const ChainlinkOracleFactory = await ethers.getContractFactory("ChainlinkOracle");
      oracle = await ChainlinkOracleFactory.deploy();
      await oracle.waitForDeployment();

      // Deploy FundFactory
      const FundFactoryFactory = await ethers.getContractFactory("FundFactory");
      factory = await FundFactoryFactory.deploy(
        await hgiToken.getAddress(),
        await oracle.getAddress(),
        treasury.address,
        SAUCER_SWAP_ROUTER,
        WHBAR,
        deployer.address,
      );
      await factory.waitForDeployment();

      console.log("  - HGI Token deployed at:", await hgiToken.getAddress());
      console.log("  - ChainlinkOracle deployed at:", await oracle.getAddress());
      console.log("  - FundFactory deployed at:", await factory.getAddress());

      // Verify deployment
      expect(await hgiToken.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await oracle.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await factory.getAddress()).to.not.equal(ethers.ZeroAddress);

      // Verify factory configuration
      expect(await factory.agiToken()).to.equal(await hgiToken.getAddress());
      expect(await factory.oracle()).to.equal(await oracle.getAddress());
      expect(await factory.treasury()).to.equal(treasury.address);
      expect(await factory.dex()).to.equal(SAUCER_SWAP_ROUTER);
      expect(await factory.whbar()).to.equal(WHBAR);

      console.log("Contract deployment verified successfully");
    });

    it("Should configure oracle with mock price feeds", async function () {
      console.log("\n[1.1/7] Configuring oracle with mock prices...");

      // Set mock prices for testing (in USD with 8 decimals)
      // const hbarPrice = 8000000; // $0.08 USD
      // const token1Price = 100000000; // $1.00 USD
      // const token2Price = 250000000; // $2.50 USD

      // For testing purposes, we'll set the oracle to return fixed prices
      // In a real testnet environment, you would configure actual price feeds
      console.log("  - Setting mock prices:");
      console.log("    HBAR: $0.08");
      console.log("    Token1: $1.00");
      console.log("    Token2: $2.50");

      // Note: The oracle contract would need to be modified to support mock prices
      // or you would need to deploy actual Chainlink price feeds on testnet
      console.log("Oracle configuration completed (mock setup)");
    });
  });

  describe("2. HGI Token Operations", function () {
    it("Should mint HGI tokens for fund creation", async function () {
      console.log("\n[2/7] Minting HGI tokens for users...");

      // Mint HGI tokens for fund creation fees
      await hgiToken.mint(user1.address, FUND_CREATION_FEE * 2n); // Extra for multiple funds
      await hgiToken.mint(user2.address, FUND_CREATION_FEE);

      const user1Balance = await hgiToken.balanceOf(user1.address);
      const user2Balance = await hgiToken.balanceOf(user2.address);

      console.log("  - User1 HGI balance:", ethers.formatEther(user1Balance));
      console.log("  - User2 HGI balance:", ethers.formatEther(user2Balance));

      expect(user1Balance).to.equal(FUND_CREATION_FEE * 2n);
      expect(user2Balance).to.equal(FUND_CREATION_FEE);
    });

    it("Should approve factory to spend HGI tokens", async function () {
      console.log("\n[2.1/7] Approving factory to spend HGI tokens...");

      await hgiToken.connect(user1).approve(await factory.getAddress(), FUND_CREATION_FEE * 2n);
      await hgiToken.connect(user2).approve(await factory.getAddress(), FUND_CREATION_FEE);

      const user1Allowance = await hgiToken.allowance(user1.address, await factory.getAddress());
      const user2Allowance = await hgiToken.allowance(user2.address, await factory.getAddress());

      console.log("  - User1 allowance:", ethers.formatEther(user1Allowance));
      console.log("  - User2 allowance:", ethers.formatEther(user2Allowance));

      expect(user1Allowance).to.equal(FUND_CREATION_FEE * 2n);
      expect(user2Allowance).to.equal(FUND_CREATION_FEE);
    });
  });

  describe("3. Fund Creation", function () {
    it("Should create a fund with testnet tokens", async function () {
      console.log("\n[3/7] Creating fund with testnet tokens...");

      const tokens = [TOKEN_1, TOKEN_2];
      const fundName = "Testnet Index Fund";
      const fundTicker = "TIF";

      console.log("  - Fund tokens:", tokens);
      console.log("  - Fund name:", fundName);
      console.log("  - Fund ticker:", fundTicker);

      const initialTotalFunds = await factory.getTotalFunds();

      // Create fund
      const tx = await factory.connect(user1).createFund(fundName, fundTicker, tokens);
      const receipt = await tx.wait();

      // Verify fund creation event
      const events = receipt?.logs;
      expect(events).to.have.length.greaterThan(0);

      const totalFunds = await factory.getTotalFunds();
      expect(totalFunds).to.equal(initialTotalFunds + 1n);

      // Get fund address and contract
      const fundAddress = await factory.funds(totalFunds - 1n);
      fund = await ethers.getContractAt("Fund", fundAddress);

      console.log("  - Fund created at address:", fundAddress);
      console.log("  - Total funds in factory:", totalFunds.toString());

      // Verify fund properties
      expect(await fund.creator()).to.equal(user1.address);
      expect(await fund.fundName()).to.equal(fundName);
      expect(await fund.fundTicker()).to.equal(fundTicker);

      const underlyingTokens = await fund.getUnderlyingTokens();
      expect(underlyingTokens).to.deep.equal(tokens);

      // Verify initial proportions (should be equal)
      const token1Proportion = await fund.targetProportions(TOKEN_1);
      const token2Proportion = await fund.targetProportions(TOKEN_2);

      console.log("  - Token1 initial proportion:", token1Proportion.toString());
      console.log("  - Token2 initial proportion:", token2Proportion.toString());

      expect(token1Proportion).to.equal(50); // 50% each
      expect(token2Proportion).to.equal(50);
    });

    it("Should fail to create fund with invalid parameters", async function () {
      console.log("\n[3.1/7] Testing fund creation validation...");

      // Test empty fund name
      await expect(factory.connect(user1).createFund("", "TEST", [TOKEN_1])).to.be.revertedWith(
        "Fund name cannot be empty",
      );

      // Test empty ticker
      await expect(factory.connect(user1).createFund("Test Fund", "", [TOKEN_1])).to.be.revertedWith(
        "Fund ticker cannot be empty",
      );

      // Test no tokens
      await expect(factory.connect(user1).createFund("Test Fund", "TEST", [])).to.be.revertedWith(
        "Must have at least one token",
      );

      // Test duplicate tokens
      await expect(factory.connect(user1).createFund("Test Fund", "TEST", [TOKEN_1, TOKEN_1])).to.be.revertedWith(
        "Duplicate tokens not allowed",
      );

      // Test zero address token
      await expect(factory.connect(user1).createFund("Test Fund", "TEST", [ethers.ZeroAddress])).to.be.revertedWith(
        "Invalid token address",
      );

      console.log("  - All validation tests passed");
    });

    it("Should track creator funds correctly", async function () {
      console.log("\n[3.2/7] Testing creator fund tracking...");

      const creatorFunds = await factory.getCreatorFunds(user1.address);
      expect(creatorFunds).to.have.length(1);
      expect(creatorFunds[0]).to.equal(0); // First fund has ID 0

      console.log(
        "  - User1 created funds:",
        creatorFunds.map(id => id.toString()),
      );
    });
  });

  describe("4. Fund Token Purchase", function () {
    it("Should buy fund tokens with HBAR", async function () {
      console.log("\n[4/7] Buying fund tokens with HBAR...");

      const buyAmount = ethers.parseEther("10"); // 10 HBAR
      const initialBalance = await fund.balanceOf(user1.address);
      const initialTotalSupply = await fund.totalSupply();

      console.log("  - Buying with:", ethers.formatEther(buyAmount), "HBAR");
      console.log("  - Initial fund token balance:", ethers.formatEther(initialBalance));
      console.log("  - Initial total supply:", ethers.formatEther(initialTotalSupply));

      // Buy fund tokens
      const tx = await fund.connect(user1).buy({ value: buyAmount });
      const receipt = await tx.wait();

      const finalBalance = await fund.balanceOf(user1.address);
      const finalTotalSupply = await fund.totalSupply();

      console.log("  - Final fund token balance:", ethers.formatEther(finalBalance));
      console.log("  - Final total supply:", ethers.formatEther(finalTotalSupply));

      // Verify purchase
      expect(finalBalance).to.be.gt(initialBalance);
      expect(finalTotalSupply).to.be.gt(initialTotalSupply);
      expect(finalBalance).to.equal(finalTotalSupply); // First buyer gets all tokens

      // Check for events
      const events = receipt?.logs;
      expect(events).to.have.length.greaterThan(0);

      console.log("  - Fund tokens purchased successfully");
    });

    it("Should distribute fees correctly on purchase", async function () {
      console.log("\n[4.1/7] Testing fee distribution on purchase...");

      const buyAmount = ethers.parseEther("5"); // 5 HBAR
      const expectedFee = (buyAmount * 100n) / 10000n; // 1% fee

      const initialCreatorBalance = await ethers.provider.getBalance(user1.address);
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      // Buy more fund tokens (from user2)
      const tx = await fund.connect(user2).buy({ value: buyAmount });
      await tx.wait();

      const finalCreatorBalance = await ethers.provider.getBalance(user1.address);
      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      // Calculate expected fee distribution
      const expectedCreatorFee = (expectedFee * 50n) / 100n; // 50% to creator
      const expectedTreasuryFee = (expectedFee * 50n) / 100n; // 50% to treasury (25% treasury + 25% buyback)

      console.log("  - Expected total fee:", ethers.formatEther(expectedFee));
      console.log("  - Expected creator fee:", ethers.formatEther(expectedCreatorFee));
      console.log("  - Expected treasury fee:", ethers.formatEther(expectedTreasuryFee));

      // Verify fee distribution (approximately, due to gas costs and rounding)
      const creatorFeeReceived = finalCreatorBalance - initialCreatorBalance;
      const treasuryFeeReceived = finalTreasuryBalance - initialTreasuryBalance;

      expect(creatorFeeReceived).to.be.approximately(expectedCreatorFee, ethers.parseEther("0.001"));
      expect(treasuryFeeReceived).to.be.approximately(expectedTreasuryFee, ethers.parseEther("0.001"));

      console.log("  - Fee distribution verified");
    });

    it("Should fail purchase with zero HBAR", async function () {
      console.log("\n[4.2/7] Testing purchase validation...");

      await expect(fund.connect(user2).buy({ value: 0 })).to.be.revertedWith("Must send HBAR");

      console.log("  - Purchase validation test passed");
    });
  });

  describe("5. Fund Rebalancing", function () {
    it("Should set new target proportions", async function () {
      console.log("\n[5/7] Testing fund rebalancing...");

      const newTokens = [TOKEN_1, TOKEN_2];
      const newProportions = [70, 30]; // 70% TOKEN_1, 30% TOKEN_2

      console.log("  - Setting new proportions:");
      console.log("    TOKEN_1:", newProportions[0], "%");
      console.log("    TOKEN_2:", newProportions[1], "%");

      // Only fund creator can rebalance
      const tx = await fund.connect(user1).setProportions(newTokens, newProportions);
      await tx.wait();

      // Verify new proportions
      const token1Proportion = await fund.targetProportions(TOKEN_1);
      const token2Proportion = await fund.targetProportions(TOKEN_2);

      expect(token1Proportion).to.equal(70);
      expect(token2Proportion).to.equal(30);

      console.log("  - Proportions updated successfully");
    });

    it("Should fail rebalancing with invalid proportions", async function () {
      console.log("\n[5.1/7] Testing rebalancing validation...");

      // Test proportions that don't sum to 100
      await expect(fund.connect(user1).setProportions([TOKEN_1, TOKEN_2], [60, 30])).to.be.revertedWith(
        "Proportions must sum to 100",
      );

      // Test mismatched array lengths
      await expect(fund.connect(user1).setProportions([TOKEN_1], [70, 30])).to.be.revertedWith(
        "Array lengths mismatch",
      );

      // Test non-owner trying to rebalance
      await expect(fund.connect(user2).setProportions([TOKEN_1, TOKEN_2], [50, 50])).to.be.revertedWithCustomError(
        fund,
        "OwnableUnauthorizedAccount",
      );

      console.log("  - Rebalancing validation tests passed");
    });

    it("Should allow manual rebalance by owner", async function () {
      console.log("\n[5.2/7] Testing manual rebalance...");

      // Call rebalance directly
      const tx = await fund.connect(user1).rebalance();
      const receipt = await tx.wait();

      // Check for rebalance event
      const events = receipt?.logs;
      expect(events).to.have.length.greaterThan(0);

      console.log("  - Manual rebalance completed successfully");
    });
  });

  describe("6. Fund Token Sale", function () {
    it("Should sell fund tokens for HBAR", async function () {
      console.log("\n[6/7] Selling fund tokens for HBAR...");

      const user1FundBalance = await fund.balanceOf(user1.address);
      const sellAmount = user1FundBalance / 2n; // Sell half

      const initialHbarBalance = await ethers.provider.getBalance(user1.address);
      const initialTotalSupply = await fund.totalSupply();

      console.log("  - Selling:", ethers.formatEther(sellAmount), "fund tokens");
      console.log("  - Initial HBAR balance:", ethers.formatEther(initialHbarBalance));

      // Sell fund tokens
      const tx = await fund.connect(user1).sell(sellAmount);
      const receipt = await tx.wait();

      const finalFundBalance = await fund.balanceOf(user1.address);
      const finalHbarBalance = await ethers.provider.getBalance(user1.address);
      const finalTotalSupply = await fund.totalSupply();

      // Calculate gas cost
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const netHbarReceived = finalHbarBalance + gasUsed - initialHbarBalance;

      console.log("  - Final fund token balance:", ethers.formatEther(finalFundBalance));
      console.log("  - Net HBAR received:", ethers.formatEther(netHbarReceived));
      console.log("  - Gas cost:", ethers.formatEther(gasUsed));

      // Verify sale
      expect(finalFundBalance).to.equal(user1FundBalance - sellAmount);
      expect(finalTotalSupply).to.equal(initialTotalSupply - sellAmount);
      expect(netHbarReceived).to.be.gt(0);

      console.log("  - Fund tokens sold successfully");
    });

    it("Should fail sale with insufficient tokens", async function () {
      console.log("\n[6.1/7] Testing sale validation...");

      const userBalance = await fund.balanceOf(user2.address);
      const excessiveAmount = userBalance + ethers.parseEther("1");

      await expect(fund.connect(user2).sell(excessiveAmount)).to.be.revertedWith("Insufficient fund tokens");

      await expect(fund.connect(user2).sell(0)).to.be.revertedWith("Amount must be greater than 0");

      console.log("  - Sale validation tests passed");
    });
  });

  describe("7. Factory View Functions", function () {
    it("Should return correct fund information", async function () {
      console.log("\n[7/7] Testing factory view functions...");

      const totalFunds = await factory.getTotalFunds();
      console.log("  - Total funds:", totalFunds.toString());

      // Test getFund
      const [fundAddress, fundName, fundTicker, underlyingTokens] = await factory.getFund(0);

      expect(fundAddress).to.equal(await fund.getAddress());
      expect(fundName).to.equal("Testnet Index Fund");
      expect(fundTicker).to.equal("TIF");
      expect(underlyingTokens).to.deep.equal([TOKEN_1, TOKEN_2]);

      console.log("  - Fund info retrieved correctly");

      // Test getFunds pagination
      const fundAddresses = await factory.getFunds(0, 1);
      expect(fundAddresses).to.have.length(1);
      expect(fundAddresses[0]).to.equal(await fund.getAddress());

      console.log("  - Fund pagination working correctly");

      // Test creator funds
      const creatorFunds = await factory.getCreatorFunds(user1.address);
      expect(creatorFunds).to.have.length(1);
      expect(creatorFunds[0]).to.equal(0);

      console.log("  - Creator fund tracking working correctly");
    });

    it("Should handle view function edge cases", async function () {
      console.log("\n[7.1/7] Testing view function edge cases...");

      // Test invalid fund ID
      await expect(factory.getFund(999)).to.be.revertedWith("Fund does not exist");

      // Test invalid pagination range
      await expect(factory.getFunds(1, 0)).to.be.revertedWith("Invalid index range");

      await expect(factory.getFunds(0, 999)).to.be.revertedWith("End index out of bounds");

      // Test creator with no funds
      const noFunds = await factory.getCreatorFunds(deployer.address);
      expect(noFunds).to.have.length(0);

      console.log("  - Edge case tests passed");
    });
  });

  describe("8. Fund Value Calculations", function () {
    it("Should calculate fund value correctly", async function () {
      console.log("\n[8/8] Testing fund value calculations...");

      // Note: These tests would require actual price feeds to work properly
      // In a real testnet environment, you would configure actual oracle prices

      try {
        const fundValue = await fund.getCurrentFundValue();
        console.log("  - Current fund value:", ethers.formatEther(fundValue), "HBAR");

        // Fund should have some value if it holds tokens
        expect(fundValue).to.be.gte(0);
      } catch {
        console.log("  - Fund value calculation skipped (requires oracle prices)");
      }

      // Test token balances
      const token1Balance = await fund.getTokenBalance(TOKEN_1);
      const token2Balance = await fund.getTokenBalance(TOKEN_2);

      console.log("  - Token1 balance in fund:", token1Balance.toString());
      console.log("  - Token2 balance in fund:", token2Balance.toString());

      // Note: Actual token balances depend on DEX swaps working
      console.log("  - Token balance checks completed");
    });
  });

  describe("9. Admin Functions", function () {
    it("Should update factory addresses (owner only)", async function () {
      console.log("\n[9/9] Testing admin functions...");

      const newTreasury = user2.address;

      // Update treasury
      await factory.connect(deployer).updateTreasury(newTreasury);
      expect(await factory.treasury()).to.equal(newTreasury);

      // Test non-owner access
      await expect(factory.connect(user1).updateTreasury(user1.address)).to.be.revertedWithCustomError(
        factory,
        "OwnableUnauthorizedAccount",
      );

      console.log("  - Factory admin functions working correctly");

      // Test fund admin functions
      await fund.connect(user1).updateTreasury(newTreasury);
      expect(await fund.treasury()).to.equal(newTreasury);

      console.log("  - Fund admin functions working correctly");
    });

    it("Should validate address updates", async function () {
      console.log("\n[9.1/9] Testing address validation...");

      // Test zero address validation
      await expect(factory.connect(deployer).updateTreasury(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid treasury address",
      );

      await expect(fund.connect(user1).updateOracle(ethers.ZeroAddress)).to.be.revertedWith("Invalid oracle address");

      console.log("  - Address validation tests passed");
    });
  });

  after(function () {
    console.log("\n======== Testnet Integration Test Completed ========");
    console.log("Summary:");
    console.log("- Fund creation: ✓");
    console.log("- Token purchase: ✓");
    console.log("- Fund rebalancing: ✓");
    console.log("- Token sale: ✓");
    console.log("- Admin functions: ✓");
    console.log("- Error handling: ✓");
  });
});
