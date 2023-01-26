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
  const OracleAggregatorAddress = "0x85d9c3784B277Bc10e1504Aa8f647132ba17A674"; // Polygon Mainnet
  const BtcUsdChainlinkAddress = "0xc907E116054Ad103354f2D350FD2514433D57F6f"; // Polygon Mainnet

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
