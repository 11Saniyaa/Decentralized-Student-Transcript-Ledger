require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
       viaIR: true, 
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      blockGasLimit: 30000000,
      gasPrice: 8000000000, // 8 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      // Use reasonable gas limits
      gas: 6000000,
      gasPrice: 8000000000, // 8 gwei
      timeout: 60000,
    },
    // Uncomment when you have INFURA_PROJECT_ID and PRIVATE_KEY
     sepolia: {
       url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
       chainId: 11155111
     },
     goerli: {
       url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
       chainId: 5
     }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};