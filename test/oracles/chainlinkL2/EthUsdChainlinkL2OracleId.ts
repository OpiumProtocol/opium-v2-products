import { expect } from "chai";
import { ethers } from "hardhat";

import {
  IOracleAggregator,
  EthUsdChainlinkL2OracleId,
  EthUsdChainlinkL2OracleId__factory as EthUsdChainlinkL2OracleIdFactory,
} from "../../../typechain";

import { toBN, fromBN } from "../../utils/bn";

describe("EthUsdChainlinkL2OracleId", function () {
  // Contract
  let ethUsdChainlinkL2OracleId: EthUsdChainlinkL2OracleId;
  let oracleAggregator: IOracleAggregator;

  // Params
  const EMERGENCY_PERIOD = 3600; // 1h

  // Addresses
  const OracleAggregatorAddress = "0xd030051cd8Cc0760fb0Fa857bbFDb8f9C3dAcaDE"; // Arbitrum Testnet
  const EthUsdChainlinkAddress = "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8"; // Arbitrum Testnet
  const ChainlinkFlagsContractAddress =
    "0x491B1dDA0A8fa069bbC1125133A975BF4e85a91b"; // Arbitrum Testnet

  before(async () => {
    oracleAggregator = await ethers.getContractAt(
      "IOracleAggregator",
      OracleAggregatorAddress
    );

    const EthUsdChainlinkL2OracleId =
      await ethers.getContractFactory<EthUsdChainlinkL2OracleIdFactory>(
        "EthUsdChainlinkL2OracleId"
      );

    ethUsdChainlinkL2OracleId = await EthUsdChainlinkL2OracleId.deploy(
      OracleAggregatorAddress,
      EMERGENCY_PERIOD,
      EthUsdChainlinkAddress,
      ChainlinkFlagsContractAddress
    );
    await ethUsdChainlinkL2OracleId.deployed();
  });

  it("Should have correct setup", async function () {
    // Ownership
    expect(await ethUsdChainlinkL2OracleId.priceFeed()).to.equal(
      EthUsdChainlinkAddress,
      "Wrong price feed"
    );
  });

  it("Should return ETH/USD price and its greater than 0", async function () {
    const result = await ethUsdChainlinkL2OracleId.getResult();
    console.log(`Chainlink ETH/USD value: ${fromBN(result)}`);
    expect(result.gt(toBN("0"))).to.equal(true, "Wrong price feed");
  });

  it("Should settle ETH/USD price in OracleAggregator", async function () {
    const now = ~~(Date.now() / 1000) - 3600;
    const result = await ethUsdChainlinkL2OracleId.getResult();

    expect(
      await oracleAggregator.hasData(ethUsdChainlinkL2OracleId.address, now)
    ).to.equal(false, "Wrong price feed");
    await expect(
      oracleAggregator.getData(ethUsdChainlinkL2OracleId.address, now)
    ).to.be.revertedWith("O2");

    await ethUsdChainlinkL2OracleId._callback(now);

    expect(
      await oracleAggregator.hasData(ethUsdChainlinkL2OracleId.address, now)
    ).to.equal(true, "Wrong price feed");
    expect(
      await oracleAggregator.getData(ethUsdChainlinkL2OracleId.address, now)
    ).to.equal(result, "Wrong price feed");
  });
});
