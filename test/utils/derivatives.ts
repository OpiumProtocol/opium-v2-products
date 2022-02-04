import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { toBN } from "./bn";

export type TDerivative = {
  margin: BigNumber;
  endTime: number;
  params: BigNumber[];
  oracleId: string;
  token: string;
  syntheticId: string;
};

export const derivativeFactory = (
  derivative: Partial<TDerivative>
): TDerivative => {
  const def = {
    margin: toBN("0"),
    endTime: 0,
    params: [],
    oracleId: ethers.constants.AddressZero,
    token: ethers.constants.AddressZero,
    syntheticId: ethers.constants.AddressZero,
  };

  return {
    ...def,
    ...derivative,
  };
};
