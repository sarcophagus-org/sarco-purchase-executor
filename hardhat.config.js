require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('hardhat-deploy');


module.exports = {
  solidity: "0.8.4",
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
};
