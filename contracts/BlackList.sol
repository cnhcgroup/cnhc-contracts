// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./Ownable.sol";

contract BlackList is Ownable{

    mapping (address => bool) public blackList;

    event AddedBlackList(address _user);

    event RemovedBlackList(address _user);

    constructor() internal{}
    
    function addBlackList(address _user) external onlyOwner {
        blackList[_user] = true;
        emit AddedBlackList(_user);
    }

    function removeBlackList(address _user) external onlyOwner {
        blackList[_user] = false;
        emit RemovedBlackList(_user);
    }

    function isBlackListUser(address _user) public view returns (bool){
        return blackList[_user];
    }

    modifier isNotBlackUser(address _user) {
        require(!isBlackListUser(_user), "BlackList: this address is in blacklist");
        _;
    }

}