const ethers = require("ethers");

const calculateUsdcSarcoRate = (pricePerSarco) => {
  // constant on contract
  const usdcToSarcoPrecision = ethers.utils.parseUnits("1", 18);

  // constant on contract
  const sarcoToUsdcDecimalFix = ethers.utils.parseUnits("1", 12);

  // assuming pricePerSarco represents the price of one single SARCO (i.e. 1 * 10**18)
  const numberOfSarco = ethers.utils.parseUnits("1", 18);

  const usdcSarcoRate = numberOfSarco.mul(usdcToSarcoPrecision).div(pricePerSarco.mul(sarcoToUsdcDecimalFix));
  return usdcSarcoRate;
}

module.exports = { calculateUsdcSarcoRate };
