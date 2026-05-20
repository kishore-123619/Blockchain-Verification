import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Certificate = await ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy();

  await certificate.waitForDeployment();

  console.log("Certificate contract deployed to:", await certificate.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

