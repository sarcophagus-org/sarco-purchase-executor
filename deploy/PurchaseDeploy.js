module.exports = async ({
    getNamedAccounts,
    deployments,
  }) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
  
    PurchaseExecutorDeployed = await deploy('PurchaseExecutor', {
      from: deployer,
      gasLimit: 4000000,
      args: [
        1, // usdc_to_sarco_rate
        100, // vesting duration
        1000,// offer expiration delay
        ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
        [110, 120, 130],
        360,
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a",
        "0x8727c592F28F10b42eB0914a7f6a5885823794c0",
        "0xAE9B102741a1B60C221e39CD9526Ab38c9865AB3"
      ],
    });
    
    console.log(PurchaseExecutorDeployed.address);
  };