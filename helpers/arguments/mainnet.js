const ethers = require("ethers");
const { calculateUsdcSarcoRate } = require("../../helpers");

const rate = calculateUsdcSarcoRate(ethers.utils.parseUnits("0.40", 6));

const vestingDuration = 60 * 60 * 24 * 365 * 2; // 2 years
const offerExpiration = 60 * 60 * 24 * 15; // 15 days

const purchasers = [
  "0x709f1EDed58f310Af8f3B40399695383b35309D0",
  "0x79ea0a678cF18a95dd73660f59EE874B4A7DF13F",
  "0xF8b0a843880e67f34DB6610380a6C3631bfB3Df8",
  "0xEE15f56C09Dd300dc039dE1901BCcca32a23a253",
  "0x0b72db9A7d6514F8eaD9ff950Ea832C9E7a302D8",
  "0x19c00Bbb5E494195C68937cDa517A6FfD00685f5",
  "0x58fF93be8401BBDBe18239F609dFBc9E8e58143B",
  "0x9D4785305bd0d12b6eB27C5fb6F235fA08516C90",
  "0xC9d14dC38889070A0Dcd7D8669578926b3D87553",
  "0xa67EcE9340Dd55168B50080276be3eB94925C587",
  "0xa9F7BF2829bBd6B96cC89073996dB4F1b9A1d5A2",
  "0x452d5973628d7EaB041E8DB2417Af5C550A8c2F4",
  "0x02833B4d3FF06e993c16522A177836426F01DD9E",
  "0x330eedec07e830320b6e283befb03ba127b1a9c1",
  "0x159878e29826d22fCfC85c70613331D78c4E8BCd",
  "0x6cE72efe6b0D406E76869Debc2F8b3535782c24A",
  "0xac1B1CC2FEE62d8dc215821A7aFC1d8594FF2f92",
  "0xB84f8b0aB8b322045BB311689f3533ED99f4f246",
  "0x40c839b831c90173dc7fbce49a25274a4688ddd9",
  "0x6e9bEcc317bF34E9394a2000f9a9a61dFAd596FE",
];
const allocations = [
  ethers.utils.parseUnits("2500000", 18),
  ethers.utils.parseUnits("1875000", 18),
  ethers.utils.parseUnits("875000", 18),
  ethers.utils.parseUnits("875000", 18),
  ethers.utils.parseUnits("625000", 18),
  ethers.utils.parseUnits("625000", 18),
  ethers.utils.parseUnits("275000", 18),
  ethers.utils.parseUnits("250000", 18),
  ethers.utils.parseUnits("250000", 18),
  ethers.utils.parseUnits("250000", 18),
  ethers.utils.parseUnits("250000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("87500", 18),
  ethers.utils.parseUnits("62500", 18),
  ethers.utils.parseUnits("62500", 18),
];
const totalAllocation = ethers.utils.parseUnits("9612500", 18);

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
