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
    it('sets the correct name', async () => {
        expect(await token.name()).to.equal('Community Cash')
    })

    it('sets the correct symbol', async () => {
        expect(await token.symbol()).to.equal('RENT')
    })

    it('sets the correct decimals', async () => {
        expect(await token.decimals()).to.equal(18)
    })

    it('sets the correct total supply', async () => {
        expect(await token.totalSupply()).to.equal(totalSupply)
    })

    it('assigns total supply to the owner.', async () => {
        expect(await token.balanceOf(owner)).to.equal(totalSupply)
    })
  })

  describe('Token transfer', () => {

    describe('Success', () => {
        
      it('transfers tokens', async () => {
        await token.transfer(user1.address, amount)

        expect(await token.balanceOf(user1.address)).to.equal(amount)
        expect(await token.balanceOf(owner)).to.equal(totalSupply.sub(amount))
      })

      it('emits a transfer event', async () => {    
        await expect(token.transfer(user1.address, amount)).to.emit(token, 'Transfer').withArgs(owner, user1.address, amount)
      })
    })

    describe('Failure', () => {
        
      it('rejects insufficient balances', async () => {
        await expect(token.transfer(user1.address, totalSupply.add(amount))).to.be.reverted
      })

      it('rejects invalid recipients', async () => {
        await expect(token.transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
      })
    })
  })

  describe('Approving tokens for allowance', () => {

    describe('Success', () => {

      it('allocates an allowance token delegation', async () => {
        await token.approve(user1.address, amount)

        expect(await token.allowance(owner, user1.address)).to.equal(amount)
      })

      it('emits an approval event', async () => {
        await expect(token.approve(user1.address, amount)).to.emit(token, 'Approval').withArgs(owner, user1.address, amount)
      })
    })

    describe('Failure', () => {

      it('rejects invalid spenders', async () => {
        await expect(token.approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
      })
    })
  })

  describe('Delegated token transfers', () => {

    beforeEach(async () => {
      await token.approve(user1.address, totalSupply)
    })

    describe('Success', () => {

      beforeEach(async () => {
        await token.connect(user1).transferFrom(owner, user2, amount)
      })

      it('transfers delegated tokens', async () => {
        expect(await token.balanceOf(user2)).to.equal(amount)
        expect(await token.balanceOf(owner)).to.equal(totalSupply.sub(amount))
      })

      it('resets allowance', async () => {
        expect(await token.allowance(owner, user1.address)).to.equal(totalSupply.sub(amount))
      })

      it('emits a transfer event', async () => {    
        await expect(token.connect(user1).transferFrom(owner, user2, amount)).to.emit(token, 'Transfer').withArgs(owner, user2, amount)
      })
    })

    describe('Failure', () => {
        
      it('rejects insufficient balances', async () => {
        await expect(token.connect(user1).transferFrom(owner, user2, totalSupply.add(amount))).to.be.reverted
      })

      it('rejects insufficient allowances', async () => {
        await expect(token.connect(user1).transferFrom(owner, user2, totalSupply.add(amount))).to.be.reverted
      })

      it('rejects invalid token owner\'s and spender\'s addresses', async () => {
        await (expect(token.connect(user1).transferFrom(owner, '0x0000000000000000000000000000000000000000', amount))).to.be.rejected
        await (expect(token.connect(user1).transferFrom('0x0000000000000000000000000000000000000000', user2, amount))).to.be.rejected
      })
    })
  })
})
