module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
  
    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    PurchaseExecutorDeployed = await deploy('PurchaseExecutor', {
      from: deployer,
      gasLimit: 4000000,
      args: [],
    });

    console.log(PurchaseExecutorDeployed.address);
  };