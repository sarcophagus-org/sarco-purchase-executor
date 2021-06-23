// We import Chai to use its asserting functions here.
const { expect } = require("chai");
//const { ethers } = require("ethers");


describe("Purchase Executor Contract", function () {

    let PurchaseExecutor;
    let PurchaseExecutorDeployed;
    let SarcoTokenMock;
    let SarcoTokenMockDeployed;
    let GeneralTokenVestingMock;
    let GeneralTokenVestingMockDeployed;
    let USDCTokenMock;
    let USDCTokenMockDeployed;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    PurchaseExecutor = await ethers.getContractFactory("PurchaseExecutor");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call PurchaseExecutor.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    PurchaseExecutorDeployed = await PurchaseExecutor.deploy();
    });

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

        it("Should set constants", async function () {
            expect(await PurchaseExecutorDeployed.MAX_PURCHASERS()).to.equal(3);
            expect(await PurchaseExecutorDeployed.USDC_TO_SARCO_RATE_PRECISION()).to.equal("1000000000000000000");
            expect(await PurchaseExecutorDeployed.SARCO_TOKEN()).to.equal("0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32");
            expect(await PurchaseExecutorDeployed.SARCO_DAO()).to.equal("0xf73a1260d222f447210581DDf212D915c09a3249");
            expect(await PurchaseExecutorDeployed.GENERAL_VESTING_CONTRACT()).to.equal("0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c");
        });
    });

    describe("initialize", function () {
        
        it("_usdc_to_sarco_rate is zero, should revert", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    0, 
                    100, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130],
                    360
                )).to.be.revertedWith('PurchaseExecutor: rate must be greater than 0');
        });

        it("_vesting_end_delay should revert if less than 0", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1, 
                    0, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130],
                    360
                )).to.be.revertedWith('PurchaseExecutor: end_delay must happen in the future');
        });

        it("_offer_expiration_delay is 0 should revert", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1, 
                    100, 
                    0, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130],
                    360
                )).to.be.revertedWith("PurchaseExecutor: offer_expiration must be greater than 0");
        });
        
        it("Should set global variables", async function () {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            expect(await PurchaseExecutorDeployed.usdc_to_sarco_rate()).to.equal(1);
            expect(await PurchaseExecutorDeployed.sarco_allocations_total()).to.equal(360);
        });

        it("sarco_allocations[purchaser] does not equal 0", async () => {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1, 
                    100, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130],
                    360
                )).to.be.revertedWith("PurchaseExecutor: Allocation has already been set");
        });

        it("purchaser allocation is zero should revert", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1,  
                    100, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [0,120,130],
                    360
                )).to.be.revertedWith("PurchaseExecutor: No allocated Sarco tokens for address");
        });

        it("_sarco_allocations_total does not equal sum of allocations", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1, 
                    100, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130], 
                    350 // total should be 360
                )).to.be.revertedWith("PurchaseExecutor: Allocations_total does not equal the sum of passed allocations");
        });
    });

    describe("start", function () {
        beforeEach(async function () {
            SarcoTokenMock = await ethers.getContractFactory("SarcoTokenMock");
            SarcoTokenMockDeployed = await SarcoTokenMock.deploy();
            });
        
        it("Should revert since contract does not own allocated funds", async function () {
            await PurchaseExecutorDeployed.initialize(
                1,  
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            await expect(
                PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address))
                .to.be.revertedWith("not funded");
        });

        it("Should emit offerstarted event", async function () {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await expect(PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address))
            .to.emit(PurchaseExecutorDeployed, "OfferStarted");
        });

        it("offer_started should return true", async function () {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
            expect( await PurchaseExecutorDeployed.offer_started()).to.be.equal(true);
        });

        it("offer_expired should return true", async function () {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
            //must use evm_increasetime + mine the block
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            expect( await PurchaseExecutorDeployed.offer_expired()).to.be.equal(true);
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
                [110,120,130],
                360
            );
            await SarcoTokenMockDeployed.mint(PurchaseExecutorDeployed.address, 360);
            await PurchaseExecutorDeployed.start(SarcoTokenMockDeployed.address);
            });
        
        it("Should revert since offer has expired", async function () {
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");
            await expect (PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address
            )).to.be.revertedWith("offer expired"); 
        });

        it("Should revert since the Purchaser does not have an allocation", async function () {
            await expect (PurchaseExecutorDeployed.connect(addr1).execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.be.revertedWith("no allocation"); 
        });

        it("Should revert since the Purchaser did not approve PurchaseExector tokens", async function () {
            await expect (PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.be.revertedWith("ERC20: transfer amount exceeds balance"); 
        });

        it("Should revert since the Purchaser did not send the correct amount of USDC tokens", async function () {
            
            await expect (PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            )).to.be.revertedWith("ERC20: transfer amount exceeds balance"); 
        });

        it("Should revert since the Purchaser did not send the correct amount of USDC tokens", async function () {
            let SarcoAllocation;
            let USDCCost;
            SarcoAllocation, USDCCost = await PurchaseExecutorDeployed.get_allocation();
            console.log(USDCCost.toString());
            await USDCTokenMockDeployed.mint(owner.address,'110000000000000000000');
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
            await USDCTokenMockDeployed.mint(owner.address,'110000000000000000000');
            await USDCTokenMockDeployed.approve(PurchaseExecutorDeployed.address, '110000000000000000000');
            await (PurchaseExecutorDeployed.execute_purchase(
                USDCTokenMockDeployed.address,
                SarcoTokenMockDeployed.address,
                GeneralTokenVestingMockDeployed.address,
            ));
            // Check DAO USDC Balance
            expect (await USDCTokenMockDeployed.balanceOf( "0xf73a1260d222f447210581DDf212D915c09a3249"))
            .to.equal("110000000000000000000");
            // Check GeneralTokenVesting Balance
            expect (await SarcoTokenMockDeployed.balanceOf(GeneralTokenVestingMockDeployed.address))
            .to.be.equal(110);
            // Check purchaser vested tokens
            expect(await GeneralTokenVestingMockDeployed.getTotalTokens(SarcoTokenMockDeployed.address, owner.address))
            .to.be.equal(110);
            // Check purchaser vesting duration
            expect(await GeneralTokenVestingMockDeployed.getDuration(SarcoTokenMockDeployed.address, owner.address))
            .to.be.equal(100); 

        });


    });
});