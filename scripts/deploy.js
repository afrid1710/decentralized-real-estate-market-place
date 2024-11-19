const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const RealEstateMarketplace = await hre.ethers.getContractFactory("RealEstateMarketplace");

    // Deploy the contract
    const marketplace = await RealEstateMarketplace.deploy();

    await marketplace.deployed();

    console.log("RealEstateMarketplace deployed to:", marketplace.address);
}

// Run the main function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
