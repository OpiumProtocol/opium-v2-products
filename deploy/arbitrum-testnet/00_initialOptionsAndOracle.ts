import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { toBN } from "../../test/utils/bn";

const ID = "0-ARB-TEST";

const commission = "500"; // 5%
const collateralization = toBN("0.5"); // 50%

const OracleAggregatorAddress = "0xd030051cd8Cc0760fb0Fa857bbFDb8f9C3dAcaDE"; // Arbitrum Testnet
const EthUsdChainlinkAddress = "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8"; // Arbitrum Testnet
const EMERGENCY_PERIOD = 3600; // 1h

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, network } = hre;
  const { deploy } = deployments;

  // Skip if network is not Matic
  if (network.name !== "arbitrumTestnet") {
    return;
  }

  const { deployer } = await ethers.getNamedSigners();

  const deployOptionCallSyntheticIdResult = await deploy(
    "OptionCallSyntheticId",
    {
      from: deployer.address,
      args: [deployer.address, commission, collateralization],
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
      args: [deployer.address, commission, collateralization],
      log: true,
    }
  );

  console.log(
    `✓ OptionPutSyntheticId Deployed at ${deployOptionPutSyntheticIdResult.address}`
  );

  const deployEthUsdChainlinkOracleIdResult = await deploy(
    "EthUsdChainlinkOracleId",
    {
      from: deployer.address,
      args: [OracleAggregatorAddress, EMERGENCY_PERIOD, EthUsdChainlinkAddress],
      log: true,
    }
  );

  console.log(
    `✓ EthUsdChainlinkOracleId Deployed at ${deployEthUsdChainlinkOracleIdResult.address}`
  );

  return true;
};

export default func;
func.id = ID;
func.tags = [
  "OptionCallSyntheticId",
  "OptionPutSyntheticId",
  "EthUsdChainlinkOracleId",
];
