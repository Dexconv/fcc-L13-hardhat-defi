const { ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("./getWeth")
const { addresses } = require("../hardhat-helper.config")
const { assertArgument } = require("ethers")

async function main() {
    await getWeth()
    const [deployer] = await ethers.getSigners()

    const lendingPool = await getLendingPool(deployer)
    console.log("lending pool address: ", await lendingPool.getAddress())

    //approve
    await approveErc20(addresses.WethToken, await lendingPool.getAddress(), AMOUNT, deployer)
    console.log("depositing...")
    //deposite
    await lendingPool.deposit(addresses.WethToken, AMOUNT, deployer, 0)
    console.log("deposited.")

    //get data of the account
    let { totalDebtETH, availableBorrowsETH } = await getUserData(lendingPool, deployer)

    //calculate amount of DAI availavle
    const daiPrice = await getDAIPrice()
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toString())
    console.log(`you can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString())

    //borrow
    await borrowDai(addresses.Dai, lendingPool, amountDaiToBorrowWei, deployer)
    await getUserData(lendingPool, deployer)

    //repay
    await repay(amountDaiToBorrowWei, addresses.Dai, lendingPool, deployer)
    await getUserData(lendingPool, deployer)

    //small amount of dai left borrowed due to intrest,
    //can use uniswap to swap eth for dai and replay it
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(addresses.Dai, await lendingPool.getAddress(), amount, account)
    const tx = await lendingPool.repay(daiAddress, amount, 1, account)
    await tx.wait(1)
    console.log("repaid")
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const tx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await tx.wait(1)
    console.log("dai borrowed successfully")
}

async function getDAIPrice() {
    const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", addresses.DaiEth)
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    const description = await daiEthPriceFeed.description()
    console.log(`price for ${description} is: `, price.toString())
    return price
}

async function getUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log("total deposited: ", totalCollateralETH)
    console.log("total borrowed: ", totalDebtETH)
    console.log("total available loan: ", availableBorrowsETH)
    return { totalDebtETH, availableBorrowsETH }
}

async function approveErc20(erc20Address, spenderAddress, AmountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    console.log("approving...")
    const tx = await erc20Token.approve(spenderAddress, AmountToSpend)
    await tx.wait(1)
    console.log("approved.")
}

async function getLendingPool(account) {
    //lending pool address provider: 0xb53c1a33016b2dc2ff3653530bff1848a515c8c5
    //Full form: "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol:ILendingPoolAddressesProvider",
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        addresses.LendingPoolAddressProvider,
        account
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    //Full form: "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol:ILendingPool",
    const LendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return LendingPool
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
