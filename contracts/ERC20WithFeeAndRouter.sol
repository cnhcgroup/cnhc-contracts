// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./Ownable.sol";
import "./ERC20.sol";

contract ERC20WithFeeAndRouter is ERC20, Ownable {

  uint256 public basisPointsRate = 0;
  uint256 public maximumFee = 0;
  uint256 public routerFee = 18000000;
  string public prefix = "\x19Ethereum Signed Message:\n32";
  address public receivingFeeAddress;
  mapping (address => bool) private _routers;

  constructor (string memory name, string memory symbol) public ERC20(name, symbol) {}

  function addRouter(address _router) public onlyOwner {
      _routers[_router] = true;
  }

  function removeRouter(address _router) public onlyOwner {
      _routers[_router] = false;
  }

  function updateReceivingFeeAddress(address _receivingFeeAddress) public onlyOwner{
    receivingFeeAddress = _receivingFeeAddress;
  }

  function isRouter(address _router) public view returns (bool) {
      return _routers[_router];
  }

  function _isByRouter() internal view returns (bool) {
      return _routers[msg.sender];
  }

  function _calcFee(uint256 _value) internal view returns (uint256) {
    uint256 fee = (_value.mul(basisPointsRate)).div(10000);
    if (fee > maximumFee) {
        fee = maximumFee;
    }
    return fee;
  }

  function transfer(address _to, uint256 _value) public override virtual returns (bool) {
    uint256 fee = _calcFee(_value);
    uint256 sendAmount = _value.sub(fee);
    super.transfer(_to, sendAmount);
    if (fee > 0) {
      super.transfer(receivingFeeAddress, fee);
    }
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public override virtual returns (bool) {
    require(_to != address(0), "ERC20WithFee: transfer to the zero address");
    require(_value <= balanceOf(_from), "ERC20WithFee: transfer amount exceeds balance");
    require(_value <= allowance(_from, msg.sender), "ERC20WithFee: allowance amount exceeds allowed");
    uint256 fee = _calcFee(_value);
    uint256 sendAmount = _value.sub(fee);
    _transfer(_from, _to, sendAmount);
    if (fee > 0) {
      _transfer(_from, receivingFeeAddress, fee);
    }
    _approve(_from, msg.sender, allowance(_from, msg.sender).sub(_value, "ERC20WithFee: transfer amount exceeds allowance"));
    return true;

  }

  function setFeeParams(uint256 newBasisPoints, uint256 newMaxFee) public onlyOwner {
    basisPointsRate = newBasisPoints;
    maximumFee = newMaxFee.mul(uint256(10)**decimals());
  }

  function setRouterFee(uint256 newRouterFee) public onlyOwner {
    routerFee = newRouterFee.mul(uint256(10)**decimals());
  }

  function transferByBatchEach(address _to, uint256 _value) public{
    uint256 fee = _calcFee(_value);
    uint256 sendAmount = _value.sub(fee);
    super.transfer(_to, sendAmount);
    if (fee > 0) {
      super.transfer(receivingFeeAddress, fee);
    }
  }

  function transferFromByBatchEach(address _from, address _to, uint256 _value) public{
    if(_to != address(0) && _value <= balanceOf(_from) && _value <= allowance(_from, msg.sender)){
      uint256 fee = _calcFee(_value);
      uint256 sendAmount = _value.sub(fee);
      _transfer(_from, _to, sendAmount);
      if (fee > 0) {
        _transfer(_from, receivingFeeAddress, fee);
      }
      _approve(_from, msg.sender, allowance(_from, msg.sender).sub(_value, "ERC20WithFee: transfer amount exceeds allowance"));
    }
  }

  // 验证并发送转账交易
  function transferFromByRouterEach(address _from,address _to,uint256 _value,bytes32 _r,bytes32 _s,uint8 _v) public onlyRouter{
    if(getVerifySignatureResult(_from,_to,_value, _r, _s, _v) == _from){
      _transferFromByRouter(_from,_to,_value);
    }
  }

  function _transferFromByRouter(address _from,address _to,uint256 _value) private{
    if(_to != address(0) && _value <= balanceOf(_from)){
      uint256 fee = _calcFee(_value);
      uint256 sendAmount = _value.sub(fee);
      sendAmount = sendAmount.sub(routerFee);
      _transfer(_from, _to, sendAmount);
      if (fee > 0) {
        _transfer(_from, receivingFeeAddress, fee);
      }
      if(routerFee > 0){
        _transfer(_from,tx.origin,routerFee);
      }
    }
  }

  // 查看交易签名对应的地址
  function getVerifySignatureResult(address _from,address _to,uint256 _value,bytes32 _r,bytes32 _s,uint8 _v) public view returns(address){
    return ecrecover(getSha3Result(_from,_to,_value), _v, _r, _s);
  }

  // 获取sha3加密结果
  function getSha3Result(address _from,address _to,uint256 _value) public view returns(bytes32){
    return keccak256(abi.encodePacked(prefix,keccak256(abi.encodePacked(_from,_to,_value,address(this)))));
  }

  modifier onlyRouter(){
    require(_routers[msg.sender], 'ERC20WithFeeAndRouter: caller is not the router');
    _;
  }
}
