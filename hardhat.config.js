require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('hardhat-deploy');
require('dotenv').config()


module.exports = {
  solidity: "0.8.4",
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_PROVIDER,
      }
    }
  }
};
