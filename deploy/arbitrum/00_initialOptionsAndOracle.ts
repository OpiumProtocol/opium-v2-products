import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { EthUsdChainlinkL2OracleId } from "../../typechain";

const ID = "0-ARB-MAINNET";

const commission = "500"; // 5%

const OracleAggregatorAddress = "0x85d9c3784B277Bc10e1504Aa8f647132ba17A674"; // Arbitrum Mainnet
const EthUsdChainlinkAddress = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"; // Arbitrum Mainnet
const ChainlinkFlagsContractAddress =
  "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83"; // Arbitrum Mainnet
const EMERGENCY_PERIOD = 12 * 3600; // 12h

const ECOSYSTEM = "0xc9162e9e8A6C47E7346a3fe6Dda9fab54Dfbe49B";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, network } = hre;
  const { deploy } = deployments;

  // Skip if network is not Arbitrum Mainnet
  if (network.name !== "arbitrum") {
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

  const deployEthUsdChainlinkL2OracleIdResult = await deploy(
    "EthUsdChainlinkL2OracleId",
    {
      from: deployer.address,
      args: [
        OracleAggregatorAddress,
        EMERGENCY_PERIOD,
        EthUsdChainlinkAddress,
        ChainlinkFlagsContractAddress,
      ],
      log: true,
    }
  );

  console.log(
    `✓ EthUsdChainlinkL2OracleId Deployed at ${deployEthUsdChainlinkL2OracleIdResult.address}`
  );

  const ethUsdChainlinkL2OracleIdInstance =
    await ethers.getContract<EthUsdChainlinkL2OracleId>(
      "EthUsdChainlinkL2OracleId"
    );

  const tx1 = await ethUsdChainlinkL2OracleIdInstance
    .connect(deployer)
    .transferOwnership(ECOSYSTEM);

  await tx1.wait();

  console.log(
    `✓ EthUsdChainlinkL2OracleId @ ${deployEthUsdChainlinkL2OracleIdResult.address} Ownership transferred to ${ECOSYSTEM}`
  );

  return true;
};

export default func;
func.id = ID;
func.tags = [
  "OptionCallSyntheticId",
  "OptionPutSyntheticId",
  "EthUsdChainlinkL2OracleId",
];
