import { ethers } from "hardhat";

async function main() {
  // WHBAR ERC20 token contract on Hedera
  const whbarAddress = "0x0000000000000000000000000000000000003ad2";

  // ERC20 ABI fragment (only approve)
  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  // Connect signer (from hardhat.config accounts)
  const [signer] = await ethers.getSigners();

  // Contract instance
  const whbar = new ethers.Contract(whbarAddress, erc20Abi, signer);

  // Spender address
  const spender = "0xA2Ecc81c24Db2c41EC7c26695D27e444268502C5";

  // Approve a large amount (adjust as needed)
  const amount = ethers.parseUnits("1000000", 18); // 1M WHBAR with 18 decimals

  console.log(`Approving ${ethers.formatEther(amount)} WHBAR to spender ${spender}...`);
  console.log(`From account: ${signer.address}`);

  try {
    // Check current balance
    const balance = await whbar.balanceOf(signer.address);
    console.log(`Current WHBAR balance: ${ethers.formatEther(balance)}`);

    // Check current allowance
    const currentAllowance = await whbar.allowance(signer.address, spender);
    console.log(`Current allowance: ${ethers.formatEther(currentAllowance)}`);

    // Execute approval
    const tx = await whbar.approve(spender, amount);
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    // Verify new allowance
    const newAllowance = await whbar.allowance(signer.address, spender);
    console.log(`New allowance: ${ethers.formatEther(newAllowance)}`);
  } catch (error) {
    console.error("❌ Transaction failed:", error);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
