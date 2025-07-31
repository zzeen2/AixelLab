require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.30",
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      chainId: 1337,
      loggingEnabled: true, 
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10
      }
    }
  },
  // 디버깅 설정
  mocha: {
    timeout: 40000
  }
};