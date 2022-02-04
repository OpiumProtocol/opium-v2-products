import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { EthUsdChainlinkOracleId } from "./../../../typechain/EthUsdChainlinkOracleId.d";
import { IOracleAggregator } from "./../../../typechain/IOracleAggregator.d";

import { toBN, fromBN } from "./../../utils/bn";

describe("EthUsdChainlinkOracleId", function () {
  // Signers
  let deployer: SignerWithAddress;

  // Contract
  let ethUsdChainlinkOracleId: EthUsdChainlinkOracleId;
  let oracleAggregator: IOracleAggregator;

  // Params
  const EMERGENCY_PERIOD = 3600; // 1h

  // Addresses
  const OracleAggregatorAddress = "0xd030051cd8Cc0760fb0Fa857bbFDb8f9C3dAcaDE"; // Arbitrum Testnet
  const EthUsdChainlinkAddress = "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8"; // Arbitrum Testnet

  before(async () => {
    [deployer] = await ethers.getSigners();

    oracleAggregator = await ethers.getContractAt(
      "IOracleAggregator",
      OracleAggregatorAddress
    );

    const EthUsdChainlinkOracleId = await ethers.getContractFactory(
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
