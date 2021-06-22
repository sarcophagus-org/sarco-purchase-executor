// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("Purchase Executor Contract", function () {

    let PurchaseExecutor;
    let PurchaseExecutorDeployed;
    let SarcoTokenMock;
    let SarcoTokenMockDeployed;
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
                    100, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130],
                    360
                )).to.be.revertedWith('PurchaseExecutor: rate must be greater than 0');
        });

        it("_vesting_end_delay <= _vesting_start_delay should revert", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1, 
                    100, 
                    90, 
                    1000, 
                    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                    [110,120,130],
                    360
                )).to.be.revertedWith('PurchaseExecutor: end_delay must be greater than or equal to start_delay');
        });

        it("_offer_expiration_delay is 0 should revert", async () => {
            await expect(
                PurchaseExecutorDeployed.initialize(
                    1, 
                    100, 
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
                100, 
                1000, 
                ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", "0xf73a1260d222f447210581DDf212D915c09a3249", "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
                [110,120,130],
                360
            );
            expect(await PurchaseExecutorDeployed.usdc_to_sarco_rate()).to.equal(1);
            expect(await PurchaseExecutorDeployed.vesting_start_delay()).to.equal(100);
            expect(await PurchaseExecutorDeployed.sarco_allocations_total()).to.equal(360);
        });

        it("sarco_allocations[purchaser] does not equal 0", async () => {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
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
            // Get the ContractFactory and Signers here.
            SarcoTokenMock = await ethers.getContractFactory("SarcoTokenMock");
            SarcoTokenMockDeployed = await SarcoTokenMock.deploy();
            });
        
        it("Should revert since contract does not own allocated funds", async function () {
            await PurchaseExecutorDeployed.initialize(
                1, 
                100, 
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
});