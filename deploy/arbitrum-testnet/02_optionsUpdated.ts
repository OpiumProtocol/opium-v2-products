import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const ID = "2-ARB-TEST";

const commission = "500"; // 5%

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, network } = hre;
  const { deploy } = deployments;

  // Skip if network is not Arbitrum Testnet
  if (network.name !== "arbitrumTestnet") {
    return;
  }

  const { deployer } = await ethers.getNamedSigners();

  const deployOptionCallSyntheticIdResult = await deploy(
    "OptionCallSyntheticId",
    {
      from: deployer.address,
      args: [deployer.address, commission],
      log: true,
    }
  );

  console.log(
    `✓ OptionCallSyntheticId Deployed at ${deployOptionCallSyntheticIdResult.address}`
  );

  const deployOptionPutSyntheticIdResult = await deploy(
    "OptionPutSyntheticId",
    {
      from: deployer.address,
      args: [deployer.address, commission],
      log: true,
    }
  );

  console.log(
    `✓ OptionPutSyntheticId Deployed at ${deployOptionPutSyntheticIdResult.address}`
  );

  return true;
};

export default func;
func.id = ID;
func.tags = ["OptionCallSyntheticId", "OptionPutSyntheticId"];
