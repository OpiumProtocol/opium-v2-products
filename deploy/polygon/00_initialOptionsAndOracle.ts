import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { EthUsdChainlinkOracleId } from "../../typechain";

const ID = "0-POLY-MAINNET";

const commission = "500"; // 5%

const OracleAggregatorAddress = "0x85d9c3784B277Bc10e1504Aa8f647132ba17A674"; // Polygon Mainnet
const EthUsdChainlinkAddress = "0xF9680D99D6C9589e2a93a78A04A279e509205945"; // Polygon Mainnet
const EMERGENCY_PERIOD = 12 * 3600; // 12h

const ECOSYSTEM = "0x964C04B87D14dF4aa74169874C4B15A87EED360d";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, network } = hre;
  const { deploy } = deployments;

  // Skip if network is not Polygon Mainnet
  if (network.name !== "polygon") {
    return;
  }

  const { deployer } = await ethers.getNamedSigners();

  /** DEPLOY */

  // Option Call
  const deployOptionCallSyntheticIdResult = await deploy(
    "OptionCallSyntheticId",
    {
      from: deployer.address,
      args: [ECOSYSTEM, commission],
      log: true,
    }
  );

  console.log(
    `✓ OptionCallSyntheticId Deployed at ${deployOptionCallSyntheticIdResult.address}`
  );

  // Option Put
  const deployOptionPutSyntheticIdResult = await deploy(
    "OptionPutSyntheticId",
    {
      from: deployer.address,
      args: [ECOSYSTEM, commission],
      log: true,
    }
  );

  console.log(
    `✓ OptionPutSyntheticId Deployed at ${deployOptionPutSyntheticIdResult.address}`
  );

  // Chainlink: ETH/USD
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

  /** TUNE */
  const ethUsdChainlinkOracleIdInstance =
    await ethers.getContract<EthUsdChainlinkOracleId>(
      "EthUsdChainlinkOracleId"
    );

  const tx1 = await ethUsdChainlinkOracleIdInstance
    .connect(deployer)
    .transferOwnership(ECOSYSTEM);

  await tx1.wait();

  console.log(
    `✓ EthUsdChainlinkOracleId @ ${deployEthUsdChainlinkOracleIdResult.address} Ownership transferred to ${ECOSYSTEM}`
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
