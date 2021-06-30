// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { network } = require("hardhat");
require('dotenv').config();
const Sarcoabi = require('../contractabi/SarcoABI.json');
const USDCabi = require('../contractabi/USDCABI.json');
const GeneralVestingabi = require('../contractabi/GeneralTokenVestingABI.json');

// Run npx hardhat test --network hardhat to test against mainnet
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

        // Impersonate Sarco holder + USDC holders
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x244265a76901b8030b140a2996e6dd4703cbf20f"]
        } //SarcoToken holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xd6216fc19db775df9774a6e33526131da7d19a2c"]
        } //USDCTokenHolder1 holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xf9706224f8b7275ee159866c35f26e1f43682e20"]
        } //USDCTokenHolder2 holder
        );

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x530e0a6993ea99ffc96615af43f327225a5fe536"]
        } //USDCTokenHolder3 holder
        );

        // Get Signers
        [owner, SarcoDao] = await ethers.getSigners();
        SarcoTokenHolder = await ethers.provider.getSigner("0x244265a76901b8030b140a2996e6dd4703cbf20f");
        USDCTokenHolder1 = await ethers.provider.getSigner("0xd6216fc19db775df9774a6e33526131da7d19a2c");
        USDCTokenHolder2 = await ethers.provider.getSigner("0xf9706224f8b7275ee159866c35f26e1f43682e20");
        USDCTokenHolder3 = await ethers.provider.getSigner("0x530e0a6993ea99ffc96615af43f327225a5fe536");

        // Set Addresses
        SarcoToken = "0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a";
        USDCToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        GeneralTokenVesting = "0x8727c592F28F10b42eB0914a7f6a5885823794c0";
        ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

        // Set Contract Instances
        SarcoTokenContract = new ethers.Contract(SarcoToken, Sarcoabi, signer);
        USDCTokenContract = new ethers.Contract(USDCToken, USDCabi, signer);
        GeneralTokenVestingContract = new ethers.Contract(GeneralTokenVesting, GeneralVestingabi, signer);

        // Get the ContractFactory
        PurchaseExecutor = await ethers.getContractFactory("PurchaseExecutor");
    });

    describe("Deployment", function () {
        it("Should set constants", async function () {
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
            expect(await PurchaseExecutorDeployed.USDC_TO_SARCO_RATE_PRECISION()).to.equal("1000000000000000000");
            expect(await PurchaseExecutorDeployed.usdc_to_sarco_rate()).to.equal(1);
            expect(await PurchaseExecutorDeployed.sarco_allocations_total()).to.equal('360000000000000000000');
            expect(await PurchaseExecutorDeployed.sarco_allocations(USDCTokenHolder1._address)).to.equal('110000000000000000000');
            expect(await PurchaseExecutorDeployed.sarco_allocations(USDCTokenHolder2._address)).to.equal('120000000000000000000');
            expect(await PurchaseExecutorDeployed.sarco_allocations(USDCTokenHolder3._address)).to.equal('130000000000000000000');
            expect(await PurchaseExecutorDeployed.vesting_end_delay()).to.equal(100);
            expect(await PurchaseExecutorDeployed.offer_expiration_delay()).to.equal(1000);
        });

        it("should revert if USDC rate is 0", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: rate must be greater than 0");
        });

        it("should revert if vesting_end_delay is 0", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: end_delay must be greater than 0");
        });

        it("should revert if offer_expiration_delay is 0", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: offer_expiration must be greater than 0");
        });

        it("should revert if the length of purchaser array does not equal allocations", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: purchasers and allocations lengths must be equal");
        });

        it("should revert if the length of allocations array does not equal purchasers", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: purchasers and allocations lengths must be equal");
        });

        it("should revert if the USDCToken address is address(0)", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: _usdc_token cannot be 0 address");
        });

        it("should revert if the SarcoToken address is address(0)", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: _sarco_token cannot be 0 address");
        });

        it("should revert if the GeneralTokenVesting address is address(0)", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: _general_token_vesting cannot be 0 address");
        });

        it("should revert if the SarcoDAO address is address(0)", async function () {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: _sarco_dao cannot be 0 address");
        });

        it("should revert if purchaser is zero address", async () => {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: Purchaser Cannot be the Zero address");
        });

        it("should revert if purchaser allocation is zero", async () => {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: No allocated Sarco tokens for address");
        });

        it("should revert if _sarco_allocations_total does not equal sum of allocations", async () => {
            await expect(PurchaseExecutor.deploy(
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
            )).to.be.revertedWith("PurchaseExecutor: Allocations_total does not equal the sum of passed allocations");
        });
    });

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
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await expect(PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase(
            )).to.emit(PurchaseExecutorDeployed, "PurchaseExecuted");
        });

        it("Should revert if you attempt to purchase twice", async function () {
            let SarcoAllocation;
            let USDCCost;
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            // Purchase 1
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();
            // Purchase 2
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await expect(PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase()
            ).to.be.revertedWith("PurchaseExecutor: you have no Sarco allocation");
        });

        it("should update Sarco DAO USDC Balance", async function () {
            let SarcoAllocation;
            let USDCCost;
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
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
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
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
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
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


    describe.only("verify usdc_to_sarco math", function () {
        it("should verify correct USDCCost - usdc_to_sarco_rate = 1", async function () {
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

            let SarcoAllocation;
            let USDCCost;
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            expect(USDCCost).to.equal('110000000');
        });

        it("should verify correct USDCCost - usdc_to_sarco_rate = 2", async function () {
            PurchaseExecutorDeployed = await PurchaseExecutor.deploy(
                2, // usdc_to_sarco_rate
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

            let SarcoAllocation;
            let USDCCost;
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            expect(USDCCost).to.equal('55000000');
        });

        it("should verify correct USDCCost - usdc_to_sarco_rate = 3", async function () {
            PurchaseExecutorDeployed = await PurchaseExecutor.deploy(
                3, // usdc_to_sarco_rate
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

            let SarcoAllocation;
            let USDCCost;
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            expect(USDCCost).to.equal('36666666');
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
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder1).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder1).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder1).execute_purchase();

            // Purchaser 2
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder2).get_allocation();
            await USDCTokenContract.connect(USDCTokenHolder2).approve(PurchaseExecutorDeployed.address, USDCCost);
            await PurchaseExecutorDeployed.connect(USDCTokenHolder2).execute_purchase();

            // Purchaser 3
            [SarcoAllocation, USDCCost] = await PurchaseExecutorDeployed.connect(USDCTokenHolder3).get_allocation();
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

    // TODO create integration test - testing components working together
});