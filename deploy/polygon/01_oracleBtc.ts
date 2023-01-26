import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BtcUsdChainlinkOracleId } from "../../typechain";

const ID = "1-POLY-MAINNET";

const OracleAggregatorAddress = "0x85d9c3784B277Bc10e1504Aa8f647132ba17A674"; // Polygon Mainnet
const BtcUsdChainlinkAddress = "0xc907E116054Ad103354f2D350FD2514433D57F6f"; // Polygon Mainnet
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

  // Chainlink: BTC/USD
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

  /** TUNE */
  const btcUsdChainlinkOracleIdInstance =
    await ethers.getContract<BtcUsdChainlinkOracleId>(
      "BtcUsdChainlinkOracleId"
    );

  const tx1 = await btcUsdChainlinkOracleIdInstance
    .connect(deployer)
    .transferOwnership(ECOSYSTEM);

  await tx1.wait();

  console.log(
    `✓ BtcUsdChainlinkOracleId @ ${deployBtcUsdChainlinkOracleIdResult.address} Ownership transferred to ${ECOSYSTEM}`
  );

  return true;
};

export default func;
func.id = ID;
func.tags = ["BtcUsdChainlinkOracleId"];
