import { BigNumber, ethers } from "ethers";

export const toBN = (value: string): BigNumber => {
  return ethers.utils.parseEther(value);
};

export const fromBN = (value: BigNumber): string => {
  return ethers.utils.formatEther(value);
};
