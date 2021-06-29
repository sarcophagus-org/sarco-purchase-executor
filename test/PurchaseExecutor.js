// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { Contract } = require("ethers");
const { network } = require("hardhat");
require('dotenv').config()
//const { ethers } = require("ethers");

describe("Purchase Executor Contract", function () {

    let PurchaseExecutor;
    let PurchaseExecutorDeployed;
    let SarcoToken;
    let SarcoTokenContract;
    let USDCToken;
    let SarcoTokenHolder;
    let USDCTokenHolder1;
    let USDCTokenHolder2;
    let USDCTokenHolder3;
    let GeneralTokenVesting;
    let owner;
    let SarcoDao;
    let ZERO_ADDRESS;

        // TODO: clean this up add to external file
        // TODO: add other contract ABIs
    const Sarcoabi = [
        {"inputs":[{"internalType":"address","name":"distributor","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
    ];
    const USDCabi = [
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RECEIVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"lostAndFound","type":"address"}],"name":"initializeV2_1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"receiveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}
    ];
    const GeneralVestingabi = [
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"beneficiary","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"beneficiary","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"VestStarted","type":"event"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"getDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"getReleasableAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"getReleasedTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"getStart","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"getTotalTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"releaseTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"beneficiary","type":"address"},{"internalType":"uint256","name":"tokensToVest","type":"uint256"},{"internalType":"uint256","name":"vestDuration","type":"uint256"},{"internalType":"contract IERC20","name":"tokenAddress","type":"address"}],"name":"startVest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"tokenVest","outputs":[{"internalType":"uint256","name":"_totalTokens","type":"uint256"},{"internalType":"uint256","name":"_releasedTokens","type":"uint256"},{"internalType":"uint256","name":"_start","type":"uint256"},{"internalType":"uint256","name":"_duration","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"}],"name":"totalVestedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
    ]
    const provider = ethers.getDefaultProvider();
    const signer = ethers.Wallet.createRandom().connect(provider);
    

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
        //reset fork
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
              forking: {
                jsonRpcUrl: process.env.MAINNET_PROVIDER
              }
            }]
        })

        // Impersonate Sarco + USDC holders
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x244265a76901b8030b140a2996e6dd4703cbf20f"]} //sarco holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xd6216fc19db775df9774a6e33526131da7d19a2c"]} //USDCTokenHolder1 holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xf9706224f8b7275ee159866c35f26e1f43682e20"]} //USDCTokenHolder2 holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x530e0a6993ea99ffc96615af43f327225a5fe536"]} //USDCTokenHolder3 holder
        );

        // Get the ContractFactory
        PurchaseExecutor = await ethers.getContractFactory("PurchaseExecutor");

        // Get Signers
        [owner, SarcoDao] = await ethers.getSigners();
        SarcoTokenHolder = await ethers.provider.getSigner("0x244265a76901b8030b140a2996e6dd4703cbf20f");
        USDCTokenHolder1 = await ethers.provider.getSigner("0xd6216fc19db775df9774a6e33526131da7d19a2c");
        USDCTokenHolder2 = await ethers.provider.getSigner("0xf9706224f8b7275ee159866c35f26e1f43682e20");
        USDCTokenHolder3 = await ethers.provider.getSigner("0x530e0a6993ea99ffc96615af43f327225a5fe536");
        
        // Set vars
        SarcoToken = "0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a";
        USDCToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        GeneralTokenVesting = "0x8727c592F28F10b42eB0914a7f6a5885823794c0";
        ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
        SarcoTokenContract = new ethers.Contract(SarcoToken, Sarcoabi, signer);
        USDCTokenContract = new ethers.Contract(USDCToken, USDCabi, signer);
        GeneralTokenVestingContract = new ethers.Contract(GeneralTokenVesting, GeneralVestingabi, signer);
    });

    // You can nest describe calls to create subsections.
    // Run npx hardhat test --network hardhat to test against mainnet
    describe("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define your
        // tests. It receives the test name, and a callback function.

        it("Should set constants", async function () {
            PurchaseExecutorDeployed =await PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            );
            expect(await PurchaseExecutorDeployed.USDC_TO_SARCO_RATE_PRECISION()).to.equal("1000000000000000000");
            // Checksum Addresses giving me trouble
            // expect(await PurchaseExecutorDeployed.USDC_TOKEN()).to.hexEqual(USDCToken);
            // expect(await PurchaseExecutorDeployed.SARCO_TOKEN()).to.equal(SarcoToken);
            // expect(await PurchaseExecutorDeployed.GENERAL_VESTING_CONTRACT()).to.equal(GeneralTokenVesting);
            expect(await PurchaseExecutorDeployed.usdc_to_sarco_rate()).to.equal(1);
            expect(await PurchaseExecutorDeployed.sarco_allocations_total()).to.equal('360000000000000000000');
            expect(await PurchaseExecutorDeployed.sarco_allocations(USDCTokenHolder1._address)).to.equal('110000000000000000000');
            expect(await PurchaseExecutorDeployed.sarco_allocations(USDCTokenHolder2._address)).to.equal('120000000000000000000');
            expect(await PurchaseExecutorDeployed.sarco_allocations(USDCTokenHolder3._address)).to.equal('130000000000000000000');
            expect(await PurchaseExecutorDeployed.vesting_end_delay()).to.equal(100);
            expect(await PurchaseExecutorDeployed.offer_expiration_delay()).to.equal(1000);
        });

        it("should revert if USDC rate is 0", async function () {
            await expect ( PurchaseExecutor.deploy(
                0, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: rate must be greater than 0");
        });

        it("should revert if vesting_end_delay is 0", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                0, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: end_delay must be greater than 0");
        });

        it("should revert if offer_expiration_delay is 0", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                0,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: offer_expiration must be greater than 0");
        });

        it("should revert if the length of purchaser array does not equal allocations", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: purchasers and allocations lengths must be equal");
        });

        it("should revert if the length of allocations array does not equal purchasers", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: purchasers and allocations lengths must be equal");
        });

        it("should revert if the USDCToken address is address(0)", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                ZERO_ADDRESS,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: _usdc_token cannot be 0 address");
        });

        it("should revert if the SarcoToken address is address(0)", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                ZERO_ADDRESS,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: _sarco_token cannot be 0 address");
        });

        it("should revert if the GeneralTokenVesting address is address(0)", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                ZERO_ADDRESS,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: _general_token_vesting cannot be 0 address");
        });

        it("should revert if the SarcoDAO address is address(0)", async function () {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                ZERO_ADDRESS
            )). to.be.revertedWith("PurchaseExecutor: _sarco_dao cannot be 0 address");
        });

        it("should revert if purchaser is zero address", async () => {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [ZERO_ADDRESS, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: Purchaser Cannot be the Zero address");
        });

        it("should revert if purchaser allocation is zero", async () => {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                [0, '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: No allocated Sarco tokens for address");
        });

        it("should revert if _sarco_allocations_total does not equal sum of allocations", async () => {
            await expect ( PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '350000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: Allocations_total does not equal the sum of passed allocations");
        });
    });

        // Todo: should check the offer started at / expire time
    describe("start", function () {
        beforeEach(async function () {
            PurchaseExecutorDeployed = await PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            );
        });

        it("Should revert if contract does not own allocated funds", async function () {
            await expect(PurchaseExecutorDeployed.start()
            ).to.be.revertedWith("PurchaseExecutor: not funded with Sarco Tokens");
        });

        it("Should emit offerstarted event", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await expect(PurchaseExecutorDeployed.start()
            ).to.emit(PurchaseExecutorDeployed, "OfferStarted");
        });

        it("offer_started should return false before start", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            expect(await PurchaseExecutorDeployed.offer_started()).to.be.equal(false);
        });

        it("offer_started should return true", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            expect(await PurchaseExecutorDeployed.offer_started()).to.be.equal(true);
        });

        it("offer_expired should return false before offer expires", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            //must use evm_increasetime + mine the block
            await network.provider.send("evm_increaseTime", [999]);
            await network.provider.send("evm_mine");
            expect(await PurchaseExecutorDeployed.offer_expired()).to.be.equal(false);
        });

        it("offer_expired should return true", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            //must use evm_increasetime + mine the block
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            expect(await PurchaseExecutorDeployed.offer_expired()).to.be.equal(true);
        });

        it("should revert if start is called twice", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            await expect(PurchaseExecutorDeployed.start()
            ).to.be.revertedWith("PurchaseExecutor: Offer has already started");
        }); 
    });

    describe("execute purchase", function () {
        beforeEach(async function () {
            PurchaseExecutorDeployed = await PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            );
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
        });

        it("Should revert since offer has expired", async function () {
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await expect(PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase(
            )).to.be.revertedWith("PurchaseExecutor: offer expired");
        });

        it("Should revert since the Purchaser does not have an allocation", async function () {
            await expect(PurchaseExecutorDeployed.connect(owner).execute_purchase(
            )).to.be.revertedWith("PurchaseExecutor: you have no Sarco allocation");
        });

        it("Should revert since the Purchaser did not approve PurchaseExecutor for purchase", async function () {
            await expect(PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase(
            )).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });

        it("Should emit PurchaseExecuted event", async function () {
            let SarcoAllocation;
            let USDCCost;
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await expect(PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase(
            )).to.emit(PurchaseExecutorDeployed, "PurchaseExecuted");
        });

        it("Should revert if you attempt to purchase twice", async function () {
            let SarcoAllocation;
            let USDCCost;
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            // Purchase 1
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();
            // Purchase 2
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await expect( PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase()
            ).to.be.revertedWith("PurchaseExecutor: you have no Sarco allocation");
        });

        it("should update Sarco DAO USDC Balance", async function () {
            let SarcoAllocation;
            let USDCCost;
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();
            // Check DAO USDC Balance
            expect(await USDCTokenContract.connect(USDCTokenHolder1).balanceOf(SarcoDao.address)
            ).to.equal(USDCCost);
        });

        it("should update GeneralTokenVesting Sarco Balance", async function () {
            let SarcoAllocation;
            let USDCCost;
            beforeTransfer = await SarcoTokenContract.connect(USDCTokenHolder1).balanceOf(GeneralTokenVesting);
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();
            // Check GeneralTokenVesting Balance
            afterTransfer = await SarcoTokenContract.connect(USDCTokenHolder1).balanceOf(GeneralTokenVesting);
            expect(afterTransfer.sub(beforeTransfer)
            ).to.be.equal('110000000000000000000');
        });

        it("should update GeneralTokenVesting contract state", async function () {
            let SarcoAllocation;
            let USDCCost;
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();
            // Check purchaser vested tokens
            expect(await GeneralTokenVestingContract.connect(USDCTokenHolder1).getTotalTokens(SarcoToken, USDCTokenHolder1._address))
                .to.be.equal('110000000000000000000');
            // Check purchaser vesting duration
            expect(await GeneralTokenVestingContract.connect(USDCTokenHolder1).getDuration(SarcoToken, USDCTokenHolder1._address))
                .to.be.equal(100);

        });
    });

    describe("recover unused tokens", function () {
        beforeEach(async function () {
            PurchaseExecutorDeployed = await PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                [USDCTokenHolder1._address, USDCTokenHolder2._address, USDCTokenHolder3._address],
                ['110000000000000000000', '120000000000000000000', '130000000000000000000'],
                '360000000000000000000',
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            );
        });

        it("Should revert - offer not started", async function () {
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens())
                .to.be.revertedWith("PurchaseExecutor: Purchase offer has not started");
        });

        it("Should revert - offer not expired", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens())
                .to.be.revertedWith("PurchaseExecutor: Purchase offer has not yet expired");
        });

        it("Should revert if there are no tokens to recover", async function () {
            // Start offer
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();

            let SarcoAllocation;
            let USDCCost;

            // Purchaser 1
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();

            // Purchaser 2
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder2).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder2).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder2).execute_purchase();

            // Purchaser 3
            [ SarcoAllocation, USDCCost ] = await PurchaseExecutorDeployed.connect(USDCTokenHolder3).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder3).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder3).execute_purchase();

            // End Offer
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");

            // Revert
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens())
                .to.be.revertedWith("PurchaseExecutor: There are no tokens to recover");
        });

        it("Should emit TokensRecovered event", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens())
                .to.emit(PurchaseExecutorDeployed, "TokensRecovered");
        });

        it("Should update DAO Balance", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, '360000000000000000000');
            await PurchaseExecutorDeployed.start();
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await PurchaseExecutorDeployed.recover_unsold_tokens();
            expect(await SarcoTokenContract.connect(SarcoTokenHolder).balanceOf(SarcoDao.address))
                .to.equal("360000000000000000000");
            expect(await SarcoTokenContract.connect(SarcoTokenHolder).balanceOf(PurchaseExecutorDeployed.address))
                .to.equal(0);
        });
    });
});