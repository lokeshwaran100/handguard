import { ethers } from "hardhat";

async function main() {
  // ERC20 token contract
  const tokenAddress = "0xa2ecc81c24db2c41ec7c26695d27e444268502c5";

  // ERC20 ABI fragment (only approve)
  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
  ];

  // Connect signer (from hardhat.config accounts)
  const [signer] = await ethers.getSigners();

  // Contract instance
  const token = new ethers.Contract(tokenAddress, erc20Abi, signer);

  // Example: approve spender to spend 100 tokens (adjust decimals if needed)
  const spender = "0xcAbc457aFb9350AA179A1cD534eF5ff8D33f7038";
  const amount = ethers.parseUnits("1000000", 18); // assumes 18 decimals

  console.log(`Approving ${amount} tokens to ${spender}...`);

  const tx = await token.approve(spender, amount);
  await tx.wait();

  console.log("✅ Approve tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
