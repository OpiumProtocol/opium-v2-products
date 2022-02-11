import { expect } from "chai";
import { ethers } from "hardhat";

import {
  IOracleAggregator,
  BtcUsdChainlinkOracleId,
  BtcUsdChainlinkOracleId__factory as BtcUsdChainlinkOracleIdFactory,
} from "../../../typechain";

import { toBN, fromBN } from "../../utils/bn";

describe("BtcUsdChainlinkOracleId", function () {
  // Contract
  let btcUsdChainlinkOracleId: BtcUsdChainlinkOracleId;
  let oracleAggregator: IOracleAggregator;

  // Params
  const EMERGENCY_PERIOD = 3600; // 1h

  // Addresses
  const OracleAggregatorAddress = "0xd030051cd8Cc0760fb0Fa857bbFDb8f9C3dAcaDE"; // Arbitrum Testnet
  const BtcUsdChainlinkAddress = "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d"; // Arbitrum Testnet

  before(async () => {
    oracleAggregator = await ethers.getContractAt(
      "IOracleAggregator",
      OracleAggregatorAddress
    );

    const BtcUsdChainlinkOracleId =
      await ethers.getContractFactory<BtcUsdChainlinkOracleIdFactory>(
        "BtcUsdChainlinkOracleId"
      );

    btcUsdChainlinkOracleId = await BtcUsdChainlinkOracleId.deploy(
      OracleAggregatorAddress,
      EMERGENCY_PERIOD,
      BtcUsdChainlinkAddress
    );
    await btcUsdChainlinkOracleId.deployed();
  });

  it("Should have correct setup", async function () {
    // Ownership
    expect(await btcUsdChainlinkOracleId.priceFeed()).to.equal(
      BtcUsdChainlinkAddress,
      "Wrong price feed"
    );
  });

  it("Should return BTC/USD price and its greater than 0", async function () {
    const result = await btcUsdChainlinkOracleId.getResult();
    console.log(`Chainlink BTC/USD value: ${fromBN(result)}`);
    expect(result.gt(toBN("0"))).to.equal(true, "Wrong price feed");
  });

  it("Should settle BTC/USD price in OracleAggregator", async function () {
    const now = ~~(Date.now() / 1000) - 3600;
    const result = await btcUsdChainlinkOracleId.getResult();

    expect(
      await oracleAggregator.hasData(btcUsdChainlinkOracleId.address, now)
    ).to.equal(false, "Wrong price feed");
    await expect(
      oracleAggregator.getData(btcUsdChainlinkOracleId.address, now)
    ).to.be.revertedWith("O2");

    await btcUsdChainlinkOracleId._callback(now);

    expect(
      await oracleAggregator.hasData(btcUsdChainlinkOracleId.address, now)
    ).to.equal(true, "Wrong price feed");
    expect(
      await oracleAggregator.getData(btcUsdChainlinkOracleId.address, now)
    ).to.equal(result, "Wrong price feed");
  });
});
