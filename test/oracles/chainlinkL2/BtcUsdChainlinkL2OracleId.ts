import { expect } from "chai";
import { ethers } from "hardhat";

import {
  IOracleAggregator,
  BtcUsdChainlinkL2OracleId,
  BtcUsdChainlinkL2OracleId__factory as BtcUsdChainlinkL2OracleIdFactory,
} from "../../../typechain";

import { toBN, fromBN } from "../../utils/bn";

describe("BtcUsdChainlinkL2OracleId", function () {
  // Contract
  let btcUsdChainlinkL2OracleId: BtcUsdChainlinkL2OracleId;
  let oracleAggregator: IOracleAggregator;

  // Params
  const EMERGENCY_PERIOD = 3600; // 1h

  // Addresses
  const OracleAggregatorAddress = "0xd030051cd8Cc0760fb0Fa857bbFDb8f9C3dAcaDE"; // Arbitrum Testnet
  const BtcUsdChainlinkAddress = "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d"; // Arbitrum Testnet
  const ChainlinkFlagsContractAddress =
    "0x491B1dDA0A8fa069bbC1125133A975BF4e85a91b"; // Arbitrum Testnet

  before(async () => {
    oracleAggregator = await ethers.getContractAt(
      "IOracleAggregator",
      OracleAggregatorAddress
    );

    const BtcUsdChainlinkL2OracleId =
      await ethers.getContractFactory<BtcUsdChainlinkL2OracleIdFactory>(
        "BtcUsdChainlinkL2OracleId"
      );

    btcUsdChainlinkL2OracleId = await BtcUsdChainlinkL2OracleId.deploy(
      OracleAggregatorAddress,
      EMERGENCY_PERIOD,
      BtcUsdChainlinkAddress,
      ChainlinkFlagsContractAddress
    );
    await btcUsdChainlinkL2OracleId.deployed();
  });

  it("Should have correct setup", async function () {
    // Ownership
    expect(await btcUsdChainlinkL2OracleId.priceFeed()).to.equal(
      BtcUsdChainlinkAddress,
      "Wrong price feed"
    );
  });

  it("Should return BTC/USD price and its greater than 0", async function () {
    const result = await btcUsdChainlinkL2OracleId.getResult();
    console.log(`Chainlink BTC/USD value: ${fromBN(result)}`);
    expect(result.gt(toBN("0"))).to.equal(true, "Wrong price feed");
  });

  it("Should settle BTC/USD price in OracleAggregator", async function () {
    const now = ~~(Date.now() / 1000) - 3600;
    const result = await btcUsdChainlinkL2OracleId.getResult();

    expect(
      await oracleAggregator.hasData(btcUsdChainlinkL2OracleId.address, now)
    ).to.equal(false, "Wrong price feed");
    await expect(
      oracleAggregator.getData(btcUsdChainlinkL2OracleId.address, now)
    ).to.be.revertedWith("O2");

    await btcUsdChainlinkL2OracleId._callback(now);

    expect(
      await oracleAggregator.hasData(btcUsdChainlinkL2OracleId.address, now)
    ).to.equal(true, "Wrong price feed");
    expect(
      await oracleAggregator.getData(btcUsdChainlinkL2OracleId.address, now)
    ).to.equal(result, "Wrong price feed");
  });
});
