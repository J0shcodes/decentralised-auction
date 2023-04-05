const hre = require("hardhat");

async function main() {
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  await auction.deployed();
  console.log("Auction address deployed to:", auction.address);
}

main();
