import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const ID = "1-ARB-TEST";

const OracleAggregatorAddress = "0xd030051cd8Cc0760fb0Fa857bbFDb8f9C3dAcaDE"; // Arbitrum Testnet
const BtcUsdChainlinkAddress = "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d"; // Arbitrum Testnet
const EMERGENCY_PERIOD = 3600; // 1h

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, network } = hre;
  const { deploy } = deployments;

  // Skip if network is not Arbitrum Testnet
  if (network.name !== "arbitrumTestnet") {
    return;
  }

  const { deployer } = await ethers.getNamedSigners();

  const deployBtcUsdChainlinkOracleIdResult = await deploy(
    "BtcUsdChainlinkOracleId",
    {
      from: deployer.address,
      args: [OracleAggregatorAddress, EMERGENCY_PERIOD, BtcUsdChainlinkAddress],
      log: true,
    }
  );

  console.log(
    `✓ BtcUsdChainlinkOracleId Deployed at ${deployBtcUsdChainlinkOracleIdResult.address}`
  );

  return true;
};

export default func;
func.id = ID;
func.tags = ["BtcUsdChainlinkOracleId"];
