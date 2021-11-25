// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./ERC20WithFeeAndRouter.sol";

abstract contract UpgradedStandardToken is ERC20WithFeeAndRouter {
    uint256 public _totalSupply;
    function transferByLegacy(address from, address to, uint256 value) public virtual returns (bool);
    function transferFromByLegacy(address sender, address from, address spender, uint256 value) public virtual returns (bool);
    function approveByLegacy(address from, address spender, uint256 value) public virtual returns (bool);
    function increaseApprovalByLegacy(address from, address spender, uint256 addedValue) public virtual returns (bool);
    function decreaseApprovalByLegacy(address from, address spender, uint256 subtractedValue) public virtual returns (bool);
    function transferByBatchEachByLegacy(address _to, uint256 _value) public virtual;
    function transferFromByBatchEachByLegacy(address sender, address _from, address _to, uint256 _value) public virtual;
    function transferFromByRouterEachByLegacy(address sender, address _from,address _to,uint256 _value,bytes32 _r,bytes32 _s,uint8 _v) public virtual;
}
