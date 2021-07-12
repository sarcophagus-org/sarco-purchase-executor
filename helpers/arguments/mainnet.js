const ethers = require("ethers");
const { calculateUsdcSarcoRate } = require("../../helpers");

const rate = calculateUsdcSarcoRate(ethers.utils.parseUnits("0.20", 6));
const vestingDuration = 60 * 60 * 24 * 7; // 7 days
const offerExpiration = 60 * 60 * 24 * 3; // 3 days
const purchasers = ["0xce823c1302B9Df4E9D0d114b3d62Fa62D09e05ec", "0x3385d34E7e8Ab15f8296124D67c11b97B34428C9", "0x1F24530e32103e6211756bDf7524762E8d777935"];
const allocations = [ethers.utils.parseUnits("50", 18), ethers.utils.parseUnits("25", 18), ethers.utils.parseUnits("25", 18)];
const totalAllocation = ethers.utils.parseUnits("100", 18);
const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const sarcoAddress = "0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a";
const vestingAddress = "0x8727c592f28f10b42eb0914a7f6a5885823794c0";
const daoAddress = "0x3299f6a52983ba00ffaa0d8c2d5075ca3f3b7991";

const mainnet = [
  rate,
  vestingDuration,
  offerExpiration,
  purchasers,
  allocations,
  totalAllocation,
  usdcAddress,
  sarcoAddress,
  vestingAddress,
  daoAddress,
];

module.exports = mainnet;
