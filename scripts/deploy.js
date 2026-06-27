const { ethers } = require("hardhat");

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Deploying RealEstate Marketplace");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "ETH\n");

  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.waitForDeployment();

  const address = await realEstate.getAddress();

  console.log("✅ RealEstate deployed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract address :", address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("Next step — verify on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});