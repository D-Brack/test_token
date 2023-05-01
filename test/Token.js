const { ethers } = require('hardhat')
const { expect } = require('chai')

describe('Token', () => {
    let token, owner, user1, totalSupply, amount

    beforeEach(async () => {
        totalSupply = 1000000
        amount = tokens(1)

        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Community Cash', 'RENT', 18, totalSupply)
        await token.deployed()

        const accounts = await ethers.getSigners()
        owner = accounts[0].address
        user1 = accounts[1]
        user2 = accounts[2].address

        totalSupply = tokens(totalSupply)
    })

    const tokens = (_value) => {
        return ethers.utils.parseUnits(_value.toString(), 'ether')
    }

    describe('Deploying Token', () => {
        it('Sets the correct name', async () => {
            expect(await token.name()).to.be.equal('Community Cash')
        })

        it('Sets the correct symbol', async () => {
            expect(await token.symbol()).to.be.equal('RENT')
        })

        it('Sets the correct decimals', async () => {
            expect(await token.decimals()).to.be.equal(18)
        })

        it('Sets the correct total supply', async () => {
            expect(await token.totalSupply()).to.be.equal(totalSupply)
        })

        it('Assigns total supply to the owner.', async () => {
            expect(await token.balanceOf(owner)).to.be.equal(totalSupply)
        })
    })

    describe('Token transfer', () => {
        describe('Success', () => {
            it('Transfers tokens', async () => {
                await token.transfer(user1.address, amount)
                expect(await token.balanceOf(user1.address)).to.be.equal(amount)
                expect(await token.balanceOf(owner)).to.be.equal(totalSupply.sub(amount))
            })

            it('Emits a transfer event', async () => {
                await expect(token.transfer(user1.address, amount)).to.emit(token, 'Transfer')
            })
        })

        describe('Failure', () => {
            it('Rejects insufficient balances', async () => {
                await expect(token.transfer(user1.address, totalSupply + amount)).to.be.rejected
            })
        })
    })

    describe('Approving tokens for delegation', () => {
        it('Approves token delegation', async () => {
            await token.approve(user1.address, amount)
            expect(await token.allowance(owner, user1.address)).to.be.equal(amount)
        })

        it('Emits an approval event', async () => {
            await expect(token.approve(user1.address, amount)).to.emit(token, 'Approval')
        })
    })

    describe('Delegated token transfers', () => {
        describe('Success', () => {
            it('Transfers delegated tokens', async () => {
                await token.approve(user1.address, amount)
                await token.connect(user1).transferFrom(owner, user2, amount)
                expect(await token.balanceOf(user2)).to.be.equal(amount)
                expect(await token.allowance(owner, user1.address)).to.be.equal(0)
            })
        })

        describe('Failure', () => {
            it('Rejects insufficient allowances', async () => {
                await expect(token.transferFrom(user1.address, user2, amount)).to.be.rejected
            })
        })
    })
})
