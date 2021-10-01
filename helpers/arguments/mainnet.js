const ethers = require("ethers");
const { calculateUsdcSarcoRate } = require("../../helpers");

const rate = calculateUsdcSarcoRate(ethers.utils.parseUnits("0.20", 6));

const vestingDuration = 60 * 60 * 24 * 365 * 2; // 2 years
const offerExpiration = 60 * 60 * 24 * 30; // 30 days

const purchasers = [
  "0x668A309f651987729Cd5383Fbe3eFbb9C1C682DE",
  "0x0A3cFc17d993a9D854B5665221b0C4B367D47bE4",
  "0x7E2E80E8250844Dd4E558f13850380D5af8F0C61",
  "0xfAF0D2bB7562d3857F27e995C8Fe8684B50132C4",
  "0xBa712398Fdb5bbb00c588e842A2475c90f7C15fe",
  "0xB1Cd805ED5B419bA4054375Ec9E99fCf1C73da02",
  "0x3e71daBC6E05755Dc3d45175dEACABf6eA6b59c9",
  "0xDE9cb838C6f42f75E2a788e592985C4BBe629f12",
];
const allocations = [
  ethers.utils.parseUnits("5000000", 18),
  ethers.utils.parseUnits("2500000", 18),
  ethers.utils.parseUnits("750000", 18),
  ethers.utils.parseUnits("750000", 18),
  ethers.utils.parseUnits("500000", 18),
  ethers.utils.parseUnits("250000", 18),
  ethers.utils.parseUnits("125000", 18),
  ethers.utils.parseUnits("125000", 18),
];
const totalAllocation = ethers.utils.parseUnits("10000000", 18);

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
