/** @type import('hardhat/config').HardhatUserConfig */
require("hardhat-deploy")
require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomicfoundation/hardhat-chai-matchers")

const PRIVATE_KEY = process.env.PRIVATE_KEY
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || ""
const GEORLI_RPC_URL = process.env.GEORLI_RPC_URL || ""
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

module.exports = {
    solidity: {
        compilers: [{ version: "0.6.12" }, { version: "0.8.8" }, { version: "0.4.19" }],
    },
    networks: {
        hardhat: {
            chainId: 31337,
            forking: { url: MAINNET_RPC_URL },
        },
        georli: {
            url: GEORLI_RPC_URL,
            chainId: 5,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            chainId: 11155111,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        //token: "ETH",
    },
    mocha: {
        timeout: 300000, //300 seconds max
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
        customChains: [],
    },
}
