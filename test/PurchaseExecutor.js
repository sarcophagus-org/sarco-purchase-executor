// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { Contract } = require("ethers");
const { network } = require("hardhat");
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

        // TODO: clean this up 
        // TODO: add other contract ABIs
    const Sarcoabi = [
        {"inputs":[{"internalType":"address","name":"distributor","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
    ];
    const provider = ethers.getDefaultProvider();
    const signer = ethers.Wallet.createRandom().connect(provider);
    

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
        // Impersonate Sarco + USDC holders
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x244265a76901b8030b140a2996e6dd4703cbf20f"]} //sarco holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa"]} //USDCTokenHolder1 holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xb1a5baace5444e7793035cbe9d58b4597655bfe3"]} //USDCTokenHolder2 holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"]} //USDCTokenHolder3 holder
        );

        // Get the ContractFactory
        PurchaseExecutor = await ethers.getContractFactory("PurchaseExecutor");

        // Get Signers
        [owner, SarcoDao] = await ethers.getSigners();
        SarcoTokenHolder = await ethers.provider.getSigner("0x244265a76901b8030b140a2996e6dd4703cbf20f");
        USDCTokenHolder1 = await ethers.provider.getSigner("0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa");
        USDCTokenHolder2 = await ethers.provider.getSigner("0xb1a5baace5444e7793035cbe9d58b4597655bfe3");
        USDCTokenHolder3 = await ethers.provider.getSigner("0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303");
        
        // Set vars
        SarcoToken = "0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a";
        USDCToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
        GeneralTokenVesting = "0x8727c592F28F10b42eB0914a7f6a5885823794c0";
        ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
        SarcoTokenContract = new ethers.Contract(SarcoToken, Sarcoabi, signer);
    });

    // You can nest describe calls to create subsections.
    // Run npx hardhat test --network hardhat to test against mainnet
    describe.only("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define your
        // tests. It receives the test name, and a callback function.

        it("Should set constants", async function () {
            PurchaseExecutorDeployed =await PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
            expect(await PurchaseExecutorDeployed.sarco_allocations_total()).to.equal(360);
            expect(await PurchaseExecutorDeployed.sarco_allocations("0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa")).to.equal(110);
            expect(await PurchaseExecutorDeployed.sarco_allocations("0xb1a5baace5444e7793035cbe9d58b4597655bfe3")).to.equal(120);
            expect(await PurchaseExecutorDeployed.sarco_allocations("0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303")).to.equal(130);
            expect(await PurchaseExecutorDeployed.vesting_end_delay()).to.equal(100);
            expect(await PurchaseExecutorDeployed.offer_expiration_delay()).to.equal(1000);
        });

        it("should revert if USDC rate is 0", async function () {
            await expect ( PurchaseExecutor.deploy(
                0, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                [ZERO_ADDRESS, "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [0, 120, 130],
                360,
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
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                350,
                USDCToken,
                SarcoToken,
                GeneralTokenVesting,
                SarcoDao.address
            )). to.be.revertedWith("PurchaseExecutor: Allocations_total does not equal the sum of passed allocations");
        });
    });

        // Todo: should check the offer started at / expire time
    describe.only("start", function () {
        beforeEach(async function () {
            PurchaseExecutorDeployed = await PurchaseExecutor.deploy(
                1, // usdc_to_sarco_rate
                100, // vesting duration
                1000,// offer experation delay
                ["0xaf6c936a0a48b8ffbf8c4725cc2d44af126904aa", "0xb1a5baace5444e7793035cbe9d58b4597655bfe3", "0x6d21266dfcf5541bee9f67c4837aaa72b3bf9303"],
                [110, 120, 130],
                360,
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
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, 360);
            await expect(PurchaseExecutorDeployed.start()
            ).to.emit(PurchaseExecutorDeployed, "OfferStarted");
        });

        it("offer_started should return false before start", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, 360);
            expect(await PurchaseExecutorDeployed.offer_started()).to.be.equal(false);
        });

        it("offer_started should return true", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start();
            expect(await PurchaseExecutorDeployed.offer_started()).to.be.equal(true);
        });

        it("offer_expired should return false before offer expires", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start();
            //must use evm_increasetime + mine the block
            await network.provider.send("evm_increaseTime", [999]);
            await network.provider.send("evm_mine");
            expect(await PurchaseExecutorDeployed.offer_expired()).to.be.equal(false);
        });

        it("offer_expired should return true", async function () {
            await SarcoTokenContract.connect(SarcoTokenHolder).transfer(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start();
            //must use evm_increasetime + mine the block
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            expect(await PurchaseExecutorDeployed.offer_expired()).to.be.equal(true);
        });
    });

    describe("execute purchase", function () {
        beforeEach(async function () {
            SarcoTokenMock = await ethers.getContractFactory("SarcoTokenMock");
            SarcoTokenMockDeployed = await SarcoTokenMock.deploy();
            GeneralTokenVestingMock = await ethers.getContractFactory("GeneralTokenVestingMock");
            GeneralTokenVestingMockDeployed = await GeneralTokenVestingMock.deploy();
            USDCTokenMock = await ethers.getContractFactory("SarcoTokenMock");
            USDCTokenMockDeployed = await SarcoTokenMock.deploy();

            await PurchaseExecutorDeployed.initialize(
                1,
                100,
                1000,
                [owner.address, "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110, 120, 130],
                360,
                "0xf73a1260d222f447210581DDf212D915c09a3249"
            );
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
        });

        it("Should revert since offer has expired", async function () {
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await expect(PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address
            )).to.be.revertedWith("urchaseExecutor: offer expired");
        });

        it("Should revert since the Purchaser does not have an allocation", async function () {
            await expect(PurchaseExecutorDeployed.connect(addr1).execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.be.revertedWith("PurchaseExecutor: you have no Sarco allocation");
        });

        it("Should revert since the Purchaser did not approve PurchaseExector tokens", async function () {
            await expect(PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Should revert since the Purchaser did not send the correct amount of USDC tokens", async function () {
            await expect(PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Should revert since the Purchaser did not send the correct amount of USDC tokens", async function () {
            let SarcoAllocation;
            let USDCCost;
            SarcoAllocation, USDCCost = await PurchaseExecutorDeployed.get_allocation();
            await USDCTokenMockDeployed.mint(owner.address, '110000000000000000000');
            await USDCTokenMockDeployed.approve(PurchaseExecutorDeployed.address, '110000000000000000000');
            await expect(PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.emit(PurchaseExecutorDeployed, "PurchaseExecuted");
        });

        it("state changes should be updated", async function () {
            let SarcoAllocation;
            let USDCCost;
            SarcoAllocation, USDCCost = await PurchaseExecutorDeployed.get_allocation();
            await USDCTokenMockDeployed.mint(owner.address, '110000000000000000000');
            await USDCTokenMockDeployed.approve(PurchaseExecutorDeployed.address, '110000000000000000000');
            await (PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            ));
            // Check DAO USDC Balance
            expect(await USDCTokenMockDeployed.balanceOf("0xf73a1260d222f447210581DDf212D915c09a3249"))
                .to.equal("110000000000000000000");
            // Check GeneralTokenVesting Balance
            expect(await SarcoTokenMockDeployed.balanceOf(GeneralTokenVestingMockDeployed.address))
                .to.be.equal(110);
            // Check purchaser vested tokens
            expect(await GeneralTokenVestingMockDeployed.getTotalTokens(SarcoTokenMockDeployed.address, owner.address))
                .to.be.equal(110);
            // Check purchaser vesting duration
            expect(await GeneralTokenVestingMockDeployed.getDuration(SarcoTokenMockDeployed.address, owner.address))
                .to.be.equal(100);

        });
    });

    describe("recover unused tokens", function () {
        beforeEach(async function () {
            SarcoTokenMock = await ethers.getContractFactory("SarcoTokenMock");
            SarcoTokenMockDeployed = await SarcoTokenMock.deploy();
            GeneralTokenVestingMock = await ethers.getContractFactory("GeneralTokenVestingMock");
            GeneralTokenVestingMockDeployed = await GeneralTokenVestingMock.deploy();
            USDCTokenMock = await ethers.getContractFactory("SarcoTokenMock");
            USDCTokenMockDeployed = await SarcoTokenMock.deploy();

            await PurchaseExecutorDeployed.initialize(
                1,
                100,
                1000,
                [owner.address, "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110, 120, 130],
                360,
                "0xf73a1260d222f447210581DDf212D915c09a3249"
            );
        });

        it("Should revert - offer not started", async function () {
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens(SarcoTokenMockDeployed.address))
                .to.be.revertedWith("PurchaseExecutor: Purchase offer has not started");
        });

        it("Should revert - offer not expired", async function () {
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens(SarcoTokenMockDeployed.address))
                .to.be.revertedWith("PurchaseExecutor: Purchase offer has not yet expired");
        });

        it("Should emit TokensRecovered event", async function () {
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await expect(PurchaseExecutorDeployed.recover_unsold_tokens(SarcoTokenMockDeployed.address))
                .to.emit(PurchaseExecutorDeployed, "TokensRecovered");
        });

        it("Should update DAO Balance", async function () {
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await PurchaseExecutorDeployed.recover_unsold_tokens(SarcoTokenMockDeployed.address);
            expect(await SarcoTokenMockDeployed.balanceOf("0xf73a1260d222f447210581DDf212D915c09a3249"))
                .to.equal("360");
            expect(await SarcoTokenMockDeployed.balanceOf(PurchaseExecutorDeployed.address))
                .to.equal(0);
        });
    });
});