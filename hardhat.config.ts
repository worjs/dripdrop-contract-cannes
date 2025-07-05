import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    // World Chain Sepolia Testnet
    "worldchain-sepolia": {
      url: " https://worldchain-sepolia.g.alchemy.com/public",
      chainId: 4801,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Hardhat local network
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      worldchain: "PLACEHOLDER", // World Chain doesn't have etherscan yet
      "worldchain-sepolia": "PLACEHOLDER", // World Chain Sepolia doesn't have etherscan yet
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "worldchain",
        chainId: 480,
        urls: {
          apiURL: "https://worldchain-mainnet.explorer.alchemy.com/api",
          browserURL: "https://worldchain-mainnet.explorer.alchemy.com",
        },
      },
      {
        network: "worldchain-sepolia",
        chainId: 4801,
        urls: {
          apiURL: "https://worldchain-sepolia.explorer.alchemy.com/api",
          browserURL: "https://worldchain-sepolia.explorer.alchemy.com",
        },
      },
    ],
  },
};

export default config;
