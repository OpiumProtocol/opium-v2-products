import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const RPC = {
  ARBITRUM_TESTNET: "https://rinkeby.arbitrum.io/rpc",
  ARBITRUM: "https://arb1.arbitrum.io/rpc",
  POLYGON: "https://polygon-rpc.com",
};

const config: HardhatUserConfig = {
  solidity: "0.8.5",
  networks: {
    hardhat: {
      forking: {
        url: RPC.POLYGON,
      },
    },
    arbitrumTestnet: {
      url: RPC.ARBITRUM_TESTNET,
      accounts: {
        mnemonic: process.env.MNEMONIC_ARBITRUM_TESTNET || "",
      },
    },
    arbitrum: {
      url: RPC.ARBITRUM,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    polygon: {
      url: RPC.POLYGON,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
