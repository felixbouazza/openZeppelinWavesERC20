const { expect } = require("chai");

describe("Waves", function () {
    let deployer; 
    let user1;
    let user2;
    let Waves;
    let oneOfWaves;

    beforeEach(async function () {
        [deployer, user1, user2] = await ethers.getSigners();
        Waves = await ethers.deployContract("Waves");
        oneOfWaves = ethers.parseUnits("1", await Waves.decimals());
    })

    describe("Deployment", function () {
        it("should set the right name", async function () {
            expect(await Waves.name()).to.equal("Waves");
        })
        it("should set the right symbol", async function () {
            expect(await Waves.symbol()).to.equal("WAV");
        })
        it("should set the right decimals", async function () {
            expect(await Waves.decimals()).to.equal(9);
        })
        it("should mint 1 WAV to the miner", async function () {
            const coinbase = await ethers.provider.send("eth_coinbase", []);
            expect(await Waves.balanceOf(coinbase)).to.equal(await Waves.MINT_REWARD());
        })
        it("should send initial supply to deployer", async function () {
            expect(await Waves.balanceOf(deployer)).to.equal(await Waves.INITIAL_SUPPLY());
        })
        it("should set the right initial totalSupply", async function () {
            expect(await Waves.totalSupply()).to.equal(await Waves.INITIAL_SUPPLY() + await Waves.MINT_REWARD());
        })
        it("Should emit a Transfer event", async function () {
            await expect(Waves.deploymentTransaction())
                .to.emit(Waves, "Transfer")
                .withArgs(ethers.ZeroAddress, deployer.address, await Waves.INITIAL_SUPPLY());
        })
        it("Should emit a Transfer event for the miner transfer", async function () {
            Waves.on("Transfer", (event) => {
                console.log(`Event emitted: ${event.event}`);
                console.log(`Args:`, event.args);
            });
            await expect(Waves.deploymentTransaction())
                .to.emit(Waves, "Transfer")
                .withArgs(
                    ethers.ZeroAddress,
                    await ethers.provider.send("eth_coinbase", []),
                    await Waves.MINT_REWARD()
                );
        })
    })

    describe("balanceOf", function () {
        it("Should return the deployer balance value", async function () {
            const coinbase = await ethers.provider.send("eth_coinbase", []);
            expect(await Waves.balanceOf(coinbase)).to.equal(oneOfWaves);
        })

        it("Should return the user balance value", async function () {
            expect(await Waves.balanceOf(deployer.address)).to.equal(await Waves.INITIAL_SUPPLY());
        })

        it("Should return the user balance value", async function () {
            expect(await Waves.balanceOf(user1.address)).to.equal(0);
        })
    })

    describe("transfer", function () {
        it("Should transfer token", async function () {
            const initialDeployerBalance = await Waves.balanceOf(deployer.address);
            const initialUser1Balance = await Waves.balanceOf(user1.address);
            await Waves.transfer(user1.address, oneOfWaves);
            expect(await Waves.balanceOf(deployer.address)).to.equal(initialDeployerBalance - oneOfWaves);
            expect(await Waves.balanceOf(user1.address)).to.equal(initialUser1Balance + oneOfWaves);
        })

        it("Should mint token and send it to the miner", async function () {
            const initialMinerBalance = await Waves.balanceOf(await ethers.provider.send("eth_coinbase", []));
            await Waves.transfer(user1.address, oneOfWaves);
            expect(await Waves.balanceOf(await ethers.provider.send("eth_coinbase", []))).to.equal(initialMinerBalance + oneOfWaves);
        })

        it("Should emit a Transfer event", async function () {
            await expect(Waves.transfer(user1.address, oneOfWaves))
                .to.emit(Waves, "Transfer")
                .withArgs(deployer.address, user1.address, oneOfWaves);
        })

        it("Should emit a Transfer event for the miner transfer", async function () {
            await expect(Waves.transfer(user1.address, oneOfWaves))
                .to.emit(Waves, "Transfer")
                .withArgs(ethers.ZeroAddress, await ethers.provider.send("eth_coinbase", []), oneOfWaves);
        })
    })
});