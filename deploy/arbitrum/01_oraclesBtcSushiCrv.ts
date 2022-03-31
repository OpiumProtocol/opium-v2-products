import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const ID = "1-ARB-MAINNET";

const OracleAggregatorAddress = "0x85d9c3784B277Bc10e1504Aa8f647132ba17A674"; // Arbitrum Mainnet
const ChainlinkFlagsContractAddress =
  "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83"; // Arbitrum Mainnet
const EMERGENCY_PERIOD = 12 * 3600; // 12h

const BtcUsdChainlinkAddress = "0x6ce185860a4963106506C203335A2910413708e9"; // Arbitrum Mainnet
const SushiUsdChainlinkAddress = "0xb2A8BA74cbca38508BA1632761b56C897060147C"; // Arbitrum Mainnet
const CrvUsdChainlinkAddress = "0xaebDA2c976cfd1eE1977Eac079B4382acb849325"; // Arbitrum Mainnet

const ECOSYSTEM = "0xc9162e9e8A6C47E7346a3fe6Dda9fab54Dfbe49B";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, network } = hre;
  const { deploy } = deployments;

  // Skip if network is not Arbitrum Mainnet
  if (network.name !== "arbitrum") {
    return;
  }

  const { deployer } = await ethers.getNamedSigners();

  const deployOracle = async (name: string, chainlinkAddress: string) => {
    const deployOracleIdResult = await deploy(name, {
      from: deployer.address,
      args: [
        OracleAggregatorAddress,
        EMERGENCY_PERIOD,
        chainlinkAddress,
        ChainlinkFlagsContractAddress,
      ],
      log: true,
    });

    console.log(`✓ ${name} Deployed at ${deployOracleIdResult.address}`);

    const oracleIdInstance = await ethers.getContract(name);

    const tx1 = await oracleIdInstance
      .connect(deployer)
      .transferOwnership(ECOSYSTEM);

    await tx1.wait();

    console.log(
      `✓ ${name} @ ${deployOracleIdResult.address} Ownership transferred to ${ECOSYSTEM}`
    );
  };

  await deployOracle("BtcUsdChainlinkL2OracleId", BtcUsdChainlinkAddress);
  await deployOracle("SushiUsdChainlinkL2OracleId", SushiUsdChainlinkAddress);
  await deployOracle("CrvUsdChainlinkL2OracleId", CrvUsdChainlinkAddress);

  return true;
};

export default func;
func.id = ID;
func.tags = [
  "BtcUsdChainlinkL2OracleId",
  "SushiUsdChainlinkL2OracleId",
  "CrvUsdChainlinkL2OracleId",
];
