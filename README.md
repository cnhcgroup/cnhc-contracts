# CNH Coin (CNHC)
CNHC Group Limit (CGL)-issued CNH-collateralized ERC20 stablecoin public smart contract repository.

https://www.cnhc.to

The contract can be found [here](https://etherscan.io/address/0x9293C7B4B4FB90FB3EE76f7C6189aA841E57E5c0)

The whitepaper can be found [here](https://static.cnhc.to/CNHC+WHITEPAPER.pdf).

## ABI, Address, and Verification

The contract abi is in `CNHCToken.abi`. It is the abi of the implementation contract. `CNHCToken.json` is fully compiled file generated by truffle.
See also our independent security audits by [PeckShield](https://peckshield.com/) and [Beosin](https://beosin.com/) in `audit-reports`.

## Contract Specification

CNHC is an ERC20 token that is Centrally Minted and Burned by CGL,
representing the trusted party backing the token with CNH.

### ERC20 Token

The public interface of CNHC is the ERC20 interface
specified by [EIP-20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md).

- `name()`
- `symbol()`
- `decimals()`
- `totalSupply()`
- `balanceOf(address who)`
- `transfer(address to, uint256 value)`
- `approve(address spender, uint256 value)`
- `allowance(address owner, address spender)`
- `transferFrom(address from, address to, uint256 value)`

And the usual events.

- `event Transfer(address indexed from, address indexed to, uint256 value)`
- `event Approval(address indexed owner, address indexed spender, uint256 value)`

Typical interaction with the contract will use `transfer` to move the token as payment.
Additionally, a pattern involving `approve` and `transferFrom` can be used to allow another 
address to move tokens from your address to a third party without the need for the middleperson 
to custody the tokens, such as in the 0x protocol. 


### Controlling the token supply

The total supply of CNHC is backed by fiat held in reserve at CGL.
There is a owner address can submit proposals for minting and burning the token and several voters can audit the proposals based on the actual movement of cash in and out of the reserve based on requests for the purchase and redemption of CNHC.


Votable Events
- `OpenProposal(uint16 pid);`
- `CloseProposal(uint16 pid);`
- `DoneProposal(uint16 pid);`
- `VoteProposal(uint16 pid, address voter);`
- `AddVoter(address voter);`
- `RemoveVoter(address voter);`

### Pausing the contract

In the event of a critical security threat, CGL has the ability to pause and unpause transfers
and approvals of the CNHC token. The ability is controlled by a single `owner` role,
 following OpenZeppelin's
[Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/access/Ownable.sol). 
The simple model for pausing transfers following OpenZeppelin's
[Pausable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/utils/Pausable.sol).


## Contract Tests

To run smart contract tests first start 

`ganache-cli`

in another terminal

Then run 

`truffle test`
