import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { OptionPutSyntheticId } from "../../../typechain/OptionPutSyntheticId";

import { toBN } from '../../utils/bn';
import { derivativeFactory } from "../../utils/derivatives";

describe("OptionPutSyntheticId", function () {
  // Signers
  let author: SignerWithAddress;
  let positionOwner: SignerWithAddress;

  // Contract
  let optionPutSyntheticId: OptionPutSyntheticId;

  // Params
  const commission = "500"; // 5%
  const collateralization = toBN("0.5"); // 50%
  const BASE = toBN("1"); // 50%

  before(async () => {
    [, author, positionOwner] = await ethers.getSigners();

    const OptionPutSyntheticId = await ethers.getContractFactory(
      "OptionPutSyntheticId"
    );

    optionPutSyntheticId = await OptionPutSyntheticId.deploy(
      author.address,
      commission,
      collateralization
    );
    await optionPutSyntheticId.deployed();
  });

  it("Should have correct setup", async function () {
    // Ownership
    expect(await optionPutSyntheticId.owner()).to.equal(
      author.address,
      "Wrong owner"
    );

    // Synthetic
    expect(await optionPutSyntheticId.getSyntheticIdName()).to.equal(
      "OPT-C",
      "Wrong syntheticId name"
    );
    expect(await optionPutSyntheticId.collateralization()).to.equal(
      collateralization,
      "Wrong collateralization"
    );

    // Commissions
    expect(await optionPutSyntheticId.getAuthorAddress()).to.equal(
      author.address,
      "Wrong author address"
    );
    expect(await optionPutSyntheticId.getAuthorCommission()).to.equal(
      commission,
      "Wrong author commission"
    );

    // Execution
    expect(
      await optionPutSyntheticId.thirdpartyExecutionAllowed(
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
    expect(await optionPutSyntheticId.validateInput(derivative)).to.equal(
      true,
      "Wrong input validation"
    );

    const sellerMargin = nominal.mul(collateralization).div(BASE);

    const margins = await optionPutSyntheticId.getMargin(derivative);
    expect(margins.buyerMargin).to.equal(toBN("0"), "Wrong buyer margin");
    expect(margins.sellerMargin).to.equal(sellerMargin, "Wrong seller margin");

    for (let i = 0; i < 2500; i += 100) {
      const result = toBN(i.toString());

      let buyerPayout = result.gt(strikePrice)
        ? toBN("0")
        : nominal.mul(strikePrice.sub(result)).div(strikePrice);

      if (buyerPayout.gt(sellerMargin)) {
        buyerPayout = sellerMargin;
      }

      const sellerPayout = sellerMargin.sub(buyerPayout);

      const payouts = await optionPutSyntheticId.getExecutionPayout(
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
