import { expect } from "chai";
import { ethers } from "hardhat";

import {
  IOracleAggregator,
  EthUsdChainlinkOracleId,
  EthUsdChainlinkOracleId__factory as EthUsdChainlinkOracleIdFactory,
} from "../../../typechain";

import { toBN, fromBN } from "../../utils/bn";

describe("EthUsdChainlinkOracleId", function () {
  // Contract
  let ethUsdChainlinkOracleId: EthUsdChainlinkOracleId;
  let oracleAggregator: IOracleAggregator;

  // Params
  const EMERGENCY_PERIOD = 3600; // 1h

  // Addresses
  const OracleAggregatorAddress = "0x85d9c3784B277Bc10e1504Aa8f647132ba17A674"; // Polygon Mainnet
  const EthUsdChainlinkAddress = "0xF9680D99D6C9589e2a93a78A04A279e509205945"; // Polygon Mainnet

  before(async () => {
    oracleAggregator = await ethers.getContractAt(
      "IOracleAggregator",
      OracleAggregatorAddress
    );

    const EthUsdChainlinkOracleId =
      await ethers.getContractFactory<EthUsdChainlinkOracleIdFactory>(
        "EthUsdChainlinkOracleId"
      );

    ethUsdChainlinkOracleId = await EthUsdChainlinkOracleId.deploy(
      OracleAggregatorAddress,
      EMERGENCY_PERIOD,
      EthUsdChainlinkAddress
    );
    await ethUsdChainlinkOracleId.deployed();
  });

  it("Should have correct setup", async function () {
    // Ownership
    expect(await ethUsdChainlinkOracleId.priceFeed()).to.equal(
      EthUsdChainlinkAddress,
      "Wrong price feed"
    );
  });

  it("Should return ETH/USD price and its greater than 0", async function () {
    const result = await ethUsdChainlinkOracleId.getResult();
    console.log(`Chainlink ETH/USD value: ${fromBN(result)}`);
    expect(result.gt(toBN("0"))).to.equal(true, "Wrong price feed");
  });

  it("Should settle ETH/USD price in OracleAggregator", async function () {
    const now = ~~(Date.now() / 1000) - 3600;
    const result = await ethUsdChainlinkOracleId.getResult();

    expect(
      await oracleAggregator.hasData(ethUsdChainlinkOracleId.address, now)
    ).to.equal(false, "Wrong price feed");
    await expect(
      oracleAggregator.getData(ethUsdChainlinkOracleId.address, now)
    ).to.be.revertedWith("O2");

    await ethUsdChainlinkOracleId._callback(now);

    expect(
      await oracleAggregator.hasData(ethUsdChainlinkOracleId.address, now)
    ).to.equal(true, "Wrong price feed");
    expect(
      await oracleAggregator.getData(ethUsdChainlinkOracleId.address, now)
    ).to.equal(result, "Wrong price feed");
  });
});
