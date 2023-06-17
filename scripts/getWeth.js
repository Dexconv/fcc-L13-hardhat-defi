const { getNamedAccounts, ethers } = require("hardhat")
const { addresses } = require("../hardhat-helper.config")

const AMOUNT = ethers.parseEther("0.02")
async function getWeth() {
    const [deployer] = await ethers.getSigners()

    //abi, contract address
    //0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    const iweth = await ethers.getContractAt("IWeth", addresses.WethToken, deployer)
    const tx = await iweth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iweth.balanceOf(deployer)
    console.log("weth balance: ", wethBalance)
}

module.exports = { getWeth, AMOUNT }
