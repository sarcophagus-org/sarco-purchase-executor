const mainnetArgs = require("../helpers/arguments/mainnet");

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
  }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    let args;

    if (chainId === "1" || !hre.network.live) {
      args = mainnetArgs;
    } else {
      console.error("deployment variables not set")
      process.exit(1)
    }

    await deploy('PurchaseExecutor', {
      log: true,
      from: deployer,
      args,
    });
  };
