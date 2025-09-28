import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Hedera Testnet Connection and Balance...");

  try {
    // Get the default signer (using the private key from config)
    const [deployer] = await ethers.getSigners();

    console.log("📍 Account Address:", deployer.address);

    // Check HBAR balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 HBAR Balance:", ethers.formatEther(balance), "HBAR");

    // Check network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.chainId.toString());

    // Get latest block to verify connection
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log("📦 Latest Block:", latestBlock);

    if (balance > 0) {
      console.log("✅ Account has HBAR balance - ready for testing!");
    } else {
      console.log("⚠️  Account has no HBAR balance - please fund the account first");
      console.log("🚰 You can get testnet HBAR from: https://portal.hedera.com/faucet");
    }
  } catch (error) {
    console.error("❌ Error checking testnet connection:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
