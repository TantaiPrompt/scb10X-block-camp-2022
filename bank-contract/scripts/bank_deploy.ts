// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.

import { ethers, run } from "hardhat";
import { delay } from "./actions/helper";

//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await run("compile");
  const RaiStone = await ethers.getContractFactory("RaiStone");
  const initialSupply = ethers.utils.parseEther("1000000");

  console.group("Deploying ERC20 Contract... \n");
  const raiStone = await RaiStone.deploy(initialSupply);
  console.log(`Tx hash: ${raiStone.deployTransaction.hash}`);
  await raiStone.deployed();
  console.log(`Contract deployed to: ${raiStone.address}\n`);
  console.groupEnd();

  await delay(1000 * 60);
  console.group("Verify Contract... \n");
  await run("verify:verify", {
    address: raiStone.address,
    constructorArguments: [initialSupply],
    contract: "contracts/RaiStone.sol:RaiStone",
  });
  console.groupEnd();

  const Bank = await ethers.getContractFactory("Bank");
  const bank = await Bank.deploy(raiStone.address);

  console.group("\nDeploying Bank Contract... \n");
  console.log(`Tx hash: ${raiStone.deployTransaction.hash}`);
  await bank.deployed();
  console.log(`Contract deployed to: ${raiStone.address}\n`);
  console.groupEnd();

  await delay(1000 * 60);

  console.group("Verify Contract... \n");
  await run("verify:verify", {
    address: bank.address,
    constructorArguments: [raiStone.address],
    contract: "contracts/Bank.sol:Bank",
  });
  console.groupEnd();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
