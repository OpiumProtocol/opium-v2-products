import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  OptionCallSyntheticId,
  OptionCallSyntheticId__factory as OptionCallSyntheticIdFactory,
} from "../../../typechain";

import { toBN } from "./../../utils/bn";
import { derivativeFactory } from "../../utils/derivatives";

describe("OptionCallSyntheticId", function () {
  // Signers
  let author: SignerWithAddress;
  let positionOwner: SignerWithAddress;

  // Contract
  let optionCallSyntheticId: OptionCallSyntheticId;

  // Params
  const commission = "500"; // 5%
  const collateralization = toBN("0.5"); // 50%
  const BASE = toBN("1"); // 50%

  before(async () => {
    [, author, positionOwner] = await ethers.getSigners();

    const OptionCallSyntheticId =
      await ethers.getContractFactory<OptionCallSyntheticIdFactory>(
        "OptionCallSyntheticId"
      );

    optionCallSyntheticId = await OptionCallSyntheticId.deploy(
      author.address,
      commission,
      collateralization
    );
    await optionCallSyntheticId.deployed();
  });

  it("Should have correct setup", async function () {
    // Ownership
    expect(await optionCallSyntheticId.owner()).to.equal(
      author.address,
      "Wrong owner"
    );

    // Synthetic
    expect(await optionCallSyntheticId.getSyntheticIdName()).to.equal(
      "OPT-C",
      "Wrong syntheticId name"
    );
    expect(await optionCallSyntheticId.collateralization()).to.equal(
      collateralization,
      "Wrong collateralization"
    );

    // Commissions
    expect(await optionCallSyntheticId.getAuthorAddress()).to.equal(
      author.address,
      "Wrong author address"
    );
    expect(await optionCallSyntheticId.getAuthorCommission()).to.equal(
      commission,
      "Wrong author commission"
    );

    // Execution
    expect(
      await optionCallSyntheticId.thirdpartyExecutionAllowed(
        positionOwner.address
      )
    ).to.equal(false, "Wrong thirdparty execution allowed");
  });

  it("Should have correct financial logic", async function () {
    const nominal = toBN("1"); // 1
    const strikePrice = toBN("1000"); // 1000
    const derivative = derivativeFactory({
      margin: nominal,
      endTime: ~~(Date.now() / 1000) + 10 * 60, // now + 10 mins
      params: [
        strikePrice,
        toBN("0"), // fixedPremium = 0
      ],
    });
    expect(await optionCallSyntheticId.validateInput(derivative)).to.equal(
      true,
      "Wrong input validation"
    );

    const sellerMargin = nominal.mul(collateralization).div(BASE);

    const margins = await optionCallSyntheticId.getMargin(derivative);
    expect(margins.buyerMargin).to.equal(toBN("0"), "Wrong buyer margin");
    expect(margins.sellerMargin).to.equal(sellerMargin, "Wrong seller margin");

    for (let i = 0; i < 2500; i += 100) {
      const result = toBN(i.toString());

      let buyerPayout = result.lt(strikePrice)
        ? toBN("0")
        : nominal.mul(result.sub(strikePrice)).div(result);

      if (buyerPayout.gt(sellerMargin)) {
        buyerPayout = sellerMargin;
      }

      const sellerPayout = sellerMargin.sub(buyerPayout);

      const payouts = await optionCallSyntheticId.getExecutionPayout(
        derivative,
        result
      );

      expect(payouts.buyerPayout).to.equal(buyerPayout, "Wrong buyer payout");
      expect(payouts.sellerPayout).to.equal(
        sellerPayout,
        "Wrong seller payout"
      );
    }
  });
});
