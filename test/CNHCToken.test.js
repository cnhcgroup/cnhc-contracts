const CNHCToken = artifacts.require('./CNHCToken.sol')
const NewToken = artifacts.require('./NewToken.sol')

contract('CNHCToken', (accounts) => {
  const initialSupply = 1000000000
  const initialVotePid = 10000;
  const owner = accounts[0]
  const accountA = accounts[1]
  const accountB = accounts[2]

  beforeEach(async()=>{
    // this.cnhcContract = await CNHCToken.at("0xB1094298d21B42b70E044A56dD1D785Fa54c07c5")
    this.cnhcContract = await CNHCToken.new(initialSupply, 6)
  })

  describe('Deployment', async()=>{
    it('deploy is successfully', async()=>{
      const address = this.cnhcContract.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('name/symbol/decimals is correct', async()=>{
      const name = await this.cnhcContract.name()
      const symbol = await this.cnhcContract.symbol()
      const decimals = await this.cnhcContract.decimals()
      assert.equal(name, 'CNHC Token')
      assert.equal(symbol, 'CNHC')
      assert.equal(decimals, 6)
    })

    it('owner/initialSupply is correct', async()=>{
      const _owner = await this.cnhcContract.owner()
      const _initialSupply = await this.cnhcContract.balanceOf(owner)
      assert.equal(_owner, owner)
      assert.equal(_initialSupply, initialSupply)
    })

  })

  describe('Normal', async()=>{
    it('transfer should work', async() => {
      const transferAmount = 100
      await this.cnhcContract.transfer(accountA, transferAmount).then(async()=>{
        const balanceOfOwner = await this.cnhcContract.balanceOf(owner)
        const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
        assert.equal(balanceOfOwner, initialSupply - transferAmount)
        assert.equal(balanceOfAccountA, transferAmount)
      })
    })

    it('transfer excced amount should throw err', async()=>{
      const transferAmount = 100
      await this.cnhcContract.transfer(accountB, transferAmount, { from: accountA }).then(assert.fail).catch(function (error) {
        assert.include(error.message, 'transfer amount exceeds balance', 'transfer excced amount should throw err.')
      })
    })

    it('transferFrom with approve should be ok', async()=>{
      const transferAmount = 100
      await this.cnhcContract.transfer(accountA, transferAmount).then(async()=>{
        const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
        assert.equal(balanceOfAccountA, transferAmount)
      }).then(async (cnhcContract) => {
        // accountA aprove to owner
        await this.cnhcContract.approve(owner, transferAmount, { from: accountA })
        const allowanceAmount1 = await this.cnhcContract.allowance(accountA, owner)
        assert.equal(allowanceAmount1.toNumber(), transferAmount)
      }).then(async (cnhcContract) => {
        await this.cnhcContract.transferFrom(accountA, accountB, transferAmount, { from: owner })

        const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
        assert.equal(balanceOfAccountA.toNumber(), 0)

        const balanceOfAccountB = await this.cnhcContract.balanceOf(accountB)
        assert.equal(balanceOfAccountB.toNumber(), transferAmount)

        const allowanceAmount2 = await this.cnhcContract.allowance(accountA, owner)
        assert.equal(allowanceAmount2.toNumber(), 0)
      })

    })

    it('transferFrom without approve should throw err', async()=>{
      const transferAmount = 100
      await this.cnhcContract.transfer(accountA, transferAmount).then(() => {
        this.cnhcContract.transferFrom(accountA, accountB, transferAmount, { from: owner }).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'allowance amount exceeds allowed', 'transferFrom without approve should throw err.')
        })
      })
    })

    it('increaseAllowance/decreaseAllowance should be ok', async()=>{
      const allowanceAmount = 100
      await this.cnhcContract.transfer(accountA, allowanceAmount).then(async()=>{
        const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
        assert.equal(balanceOfAccountA, allowanceAmount)
      }).then(async (cnhcContract) => {
        // accountA aprove to owner
        await this.cnhcContract.approve(owner, allowanceAmount, { from: accountA })
        const allowanceAmount1 = await this.cnhcContract.allowance(accountA, owner)
        assert.equal(allowanceAmount1.toNumber(), allowanceAmount)
      }).then(async (cnhcContract) => {
        await this.cnhcContract.increaseAllowance(owner, allowanceAmount, { from: accountA })
        const allowanceAmount2 = await this.cnhcContract.allowance(accountA, owner)
        assert.equal(allowanceAmount2.toNumber(), allowanceAmount + allowanceAmount)
      }).then(async (cnhcContract) => {
        await this.cnhcContract.decreaseAllowance(owner, allowanceAmount, { from: accountA })
        const allowanceAmount3 = await this.cnhcContract.allowance(accountA, owner)
        assert.equal(allowanceAmount3.toNumber(), allowanceAmount)
      })
    })

    it('burn should be ok', async()=>{
      const burnAmount = 100
      await this.cnhcContract.burn(burnAmount).then(async()=>{
        const balanceOfOwner = await this.cnhcContract.balanceOf(owner)
        assert.equal(balanceOfOwner, initialSupply - burnAmount)
      })
    })

  })

  describe('Ownable', async()=>{
    it('add black user by owner should be ok', async()=>{
      await this.cnhcContract.addBlackList(accountA).then(() => {
        this.cnhcContract.isBlackListUser(accountA).then((isBlackUser) => {
          assert.isTrue(isBlackUser)
        })
      })
    })

    it('add black user by accountA should throw err', async()=>{
      await this.cnhcContract.addBlackList(accountB, { from: accountA }).then(assert.fail).catch(function (error) {
        assert.include(error.message, 'caller is not the owner', 'add black user by accountA should throw err.')
      })
    })

    it('pause/unpause by owner should be ok', async()=>{
      await this.cnhcContract.pause().then(() => {
        this.cnhcContract.unpause()
      })
    })

    it('pause by accountA should throw err', async()=>{
      await this.cnhcContract.pause({ from: accountA }).then(assert.fail).catch(function (error) {
        assert.include(error.message, 'caller is not the owner', 'pause by accountA should throw err.')
      })
    })

    it('unpause by accountA should throw err', async()=>{
      await this.cnhcContract.unpause({ from: accountA }).then(assert.fail).catch(function (error) {
        assert.include(error.message, 'caller is not the owner', 'unpause by accountA should throw err.')
      })
    })

    it('setFeeParams by owner should be ok', async()=>{
      await this.cnhcContract.setFeeParams(50, 500)
    })

    it('setFeeParams by accountA should throw err', async()=>{
      await this.cnhcContract.setFeeParams(50, 500, { from: accountA }).then(assert.fail).catch(function (error) {
        assert.include(error.message, 'caller is not the owner', 'deprecate by accountA should throw err.')
      })
    })

    it('deprecate by owner should be ok', async()=>{
      this.newContract = await NewToken.new(initialSupply, 6)
      await this.cnhcContract.deprecate(this.newContract.address)
    })

    it('deprecate by accountA should throw err', async()=>{
      this.newContract = await NewToken.new(initialSupply, 6)
      await this.cnhcContract.deprecate(this.newContract.address, { from: accountA }).then(assert.fail).catch(function (error) {
        assert.include(error.message, 'caller is not the owner', 'deprecate by accountA should throw err.')
      })
    })

  })

  describe('BlackList', async()=>{
    it('addBlackList/removeBlackList should work', async()=>{
      await this.cnhcContract.addBlackList(accountA).then(() => {
        this.cnhcContract.isBlackListUser(accountA).then((isBlackUser) => {
          assert.isTrue(isBlackUser)
        })
      }).then(async (cnhcContract) => {
        await this.cnhcContract.removeBlackList(accountA).then(() => {
          this.cnhcContract.isBlackListUser(accountA).then((isBlackUser) => {
            assert.isFalse(isBlackUser)
          })
        })
      })
    })

    it('transfer/transferFrom/approve/increaseAllowance/decreaseAllowance by black user should throw err', async()=>{
      await this.cnhcContract.addBlackList(accountA).then(() => {
        this.cnhcContract.transfer(accountB, 100, { from: accountA }).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'this address is in blacklist', 'transfer by black user should throw err.')
        })

        this.cnhcContract.transferFrom(owner, accountB, 100, { from: accountA }).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'this address is in blacklist', 'transferFrom by black user should throw err.')
        })

        this.cnhcContract.approve(owner, 100, { from: accountA }).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'this address is in blacklist', 'approve by black user should throw err.')
        })

        this.cnhcContract.increaseAllowance(owner, 100, { from: accountA }).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'this address is in blacklist', 'increaseAllowance by black user should throw err.')
        })

        this.cnhcContract.decreaseAllowance(owner, 100, { from: accountA }).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'this address is in blacklist', 'decreaseAllowance by black user should throw err.')
        })
      })
    })

  })

  describe('Pausable', async()=>{
    it('pause/unpause should work', async()=>{
      await this.cnhcContract.pause().then(async()=>{
        const paused = await this.cnhcContract.paused()
        assert.isTrue(paused)

        await this.cnhcContract.openMintProposal(accountA, 100).then(async()=>{
          await this.cnhcContract.voteProposal(initialVotePid).then(assert.fail).catch(function (error) {
            assert.include(error.message, 'call payload failed')
          })
        })

        await this.cnhcContract.burn(100).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'token transfer while paused.')
        })

        await this.cnhcContract.transfer(accountA, 100).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'token transfer while paused.')
        })
      }).then(async (cnhcContract) => {
        await this.cnhcContract.unpause()
        const paused = await this.cnhcContract.paused()
        assert.isFalse(paused)
      }).then(async (cnhcContract) => {
        const mintAmount = 100
        const burnAmount = 30
        const remainAmount = mintAmount - burnAmount

        await this.cnhcContract.openMintProposal(accountA, mintAmount).then(async()=>{
          await this.cnhcContract.voteProposal(initialVotePid).then(async()=>{
            const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
            assert.equal(balanceOfAccountA, mintAmount)
          })
        })

        await this.cnhcContract.burn(burnAmount, { from: accountA }).then(async()=>{
          const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
          assert.equal(balanceOfAccountA, remainAmount)
        })

        await this.cnhcContract.transfer(accountB, remainAmount, { from: accountA }).then(async()=>{
          const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
          assert.equal(balanceOfAccountA, 0)

          const balanceOfAccountB = await this.cnhcContract.balanceOf(accountB)
          assert.equal(balanceOfAccountB, remainAmount)
        })
      })
    })

  })

  describe('Fee', async()=>{
    it('setFee should work', async()=>{
      const transferAmount = 10000
      await this.cnhcContract.transfer(accountA, transferAmount).then(async()=>{
        await this.cnhcContract.updateReceivingFeeAddress(owner)
        await this.cnhcContract.setFeeParams(50, 500).then(async()=>{
          const fee = transferAmount * 50 / 10000
          await this.cnhcContract.transfer(accountB, transferAmount, { from: accountA }).then(async()=>{
            const balanceOfAccountA = await this.cnhcContract.balanceOf(accountA)
            assert.equal(balanceOfAccountA, 0)

            const balanceOfAccountB = await this.cnhcContract.balanceOf(accountB)
            assert.equal(balanceOfAccountB, transferAmount - fee)

            const balanceOfOwner = await this.cnhcContract.balanceOf(owner)
            assert.equal(balanceOfOwner, initialSupply - transferAmount + fee)
          })
        })
      })
    })
  })

  describe('Deprecate and Upgrade', async()=>{
    it('deprecate and upgrade contract should work', async()=>{
      this.newContract = await NewToken.new(initialSupply, 6)
      await this.cnhcContract.deprecate(this.newContract.address).then(async()=>{
        const deprecated = await this.cnhcContract.deprecated()
        assert.isTrue(deprecated)

        // upgrade
        await this.cnhcContract.transfer(accountA, 100).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'transferByLegacy()')
        })

        // old function
        const oldBalanceOfOwner = await this.cnhcContract.oldBalanceOf(owner)
        assert.equal(oldBalanceOfOwner, initialSupply)
      })
    })
  })

  describe('Vote', async()=>{
    it('add voter should work', async()=>{
      const accountAIsVoter0 = await this.cnhcContract.voters(accountA)
      assert.isFalse(accountAIsVoter0)

      // const voterAccount = web3.eth.accounts.create();
      await this.cnhcContract.openAddVoterProposal(accountA).then(async()=>{
        const accountAIsVoter1 = await this.cnhcContract.voters(accountA)
        assert.isFalse(accountAIsVoter1)
        const voterCount1 = await this.cnhcContract.votersCount()
        assert.equal(voterCount1,1)
        const proposal1 = await this.cnhcContract.proposals(initialVotePid)
        assert.isFalse(proposal1.done)
        const hasVote1 = await this.cnhcContract.hasVoted(initialVotePid)
        assert.isFalse(hasVote1);

        // vote
        await this.cnhcContract.voteProposal(initialVotePid).then(async()=>{
          const accountAIsVoter2 = await this.cnhcContract.voters(accountA)
          assert.isTrue(accountAIsVoter2)
          const voterCount2 = await this.cnhcContract.votersCount()
          assert.equal(voterCount2,2)
          const proposal2 = await this.cnhcContract.proposals(initialVotePid)
          assert.isTrue(proposal2.done)
          const hasVote2 = await this.cnhcContract.hasVoted(initialVotePid)
          assert.isTrue(hasVote2);
        })
        
      })
    })

    it('remove voter should work(minority -> majority)', async()=>{
      await this.cnhcContract.openAddVoterProposal(accountA).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid)
      }).then(async()=>{
        const accountAIsVoter1 = await this.cnhcContract.voters(accountA)
        assert.isTrue(accountAIsVoter1)
        const voterCount1 = await this.cnhcContract.votersCount()
        assert.equal(voterCount1,2)
      }).then(async () =>{
        await this.cnhcContract.openRemoveVoterProposal(accountA)
      }).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid+1)
      }).then(async()=>{
        const accountAIsVoter2 = await this.cnhcContract.voters(accountA)
        assert.isTrue(accountAIsVoter2)
        const voterCount2 = await this.cnhcContract.votersCount()
        assert.equal(voterCount2,2)
      }).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid+1,{from:accountA})
      }).then(async()=>{
        const accountAIsVoter3 = await this.cnhcContract.voters(accountA)
        assert.isFalse(accountAIsVoter3)
        const voterCount3 = await this.cnhcContract.votersCount()
        assert.equal(voterCount3,1)
      })
    })

    it('only voter can do a vote', async()=>{
      await this.cnhcContract.openAddVoterProposal(accountA).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid, {from:accountA}).then(assert.fail).catch(function (error) {
          assert.include(error.message, 'only voter can call')
        })
      })
    })

    it('mint over voting should be ok', async()=>{
      const mintAmount = 100
      await this.cnhcContract.openAddVoterProposal(accountA).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid)
      }).then(async()=>{
        const accountAIsVoter = await this.cnhcContract.voters(accountA)
        assert.isTrue(accountAIsVoter)
      }).then(async()=>{
        await this.cnhcContract.openMintProposal(accountA, mintAmount)
      }).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid+1)
      }).then(async()=>{
        const balanceOfAccountABeforeMintDone = await this.cnhcContract.balanceOf(accountA)
        assert.equal(balanceOfAccountABeforeMintDone, 0)
      }).then(async()=>{
        await this.cnhcContract.voteProposal(initialVotePid+1,{from:accountA})
      }).then(async()=>{
        const balanceOfAccountAAfterMintDone = await this.cnhcContract.balanceOf(accountA)
        assert.equal(balanceOfAccountAAfterMintDone, mintAmount)
      })

    })
  })

// destroyBlackFunds

})
