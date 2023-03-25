// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is Ownable {
    mapping(address => uint) public candidates;
    uint256 public winnerVotes;
    address public winner; 
    bool public started;
    bool finished;

    constructor() Ownable() {

    }

    function startVoting() public onlyOwner {
        require(finished == false, "Can't start voting second time");
        require(started == false, "Can't start - voting is in progress");
        started = true;
    }

    function finishVoting() public onlyOwner {
        require(finished == false, "Already finished");
        require(started == true, "Can't finish - voting hasn't started");
        started = false;
        finished = true;
    }
}
