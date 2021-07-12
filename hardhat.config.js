require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('hardhat-deploy');
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");


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
        blockNumber: 12778138,
      }
    },
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_PROVIDER,
      accounts: [process.env.MAINNET_PK || ""],
    },
    ropsten: {
      chainId: 3,
      url: process.env.ROPSTEN_PROVIDER,
      accounts: [process.env.ROPSTEN_PK || ""],
    },
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_PROVIDER,
      accounts: [process.env.RINKEBY_PK || ""],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  },
  mocha: {
    timeout: 30000
  }
};
