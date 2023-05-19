// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is Ownable {
    mapping(address => uint) public candidateVotes;
    mapping(address => bool) voters;
    uint256 public winnerVotes;
    address public winner;

    bool public started;
    bool public finished;

    address[] public candidates;

    constructor() Ownable() {

    }

    function startVoting() public onlyOwner {
        require(finished == false, "Can't start voting second time");
        require(started == false, "Can't start - voting is in progress");
        require(getCandidateSize() > 0, "Can't start with 0 candidates");
        started = true;
    }

    function finishVoting() public onlyOwner {
        require(finished == false, "Already finished");
        require(started == true, "Can't finish - voting hasn't started");
        started = false;
        finished = true;
    }

    function addCandidate(address candidate) public {
        require(started == false, "Can't add candidate during voting");
        require(finished == false, "Can't add candidate after voting is finished");
        require(candidateVotes[candidate] == 0, "Candidate is already registered");
        candidateVotes[candidate] = 1;
        candidates.push(candidate);
    }

    function getCandidateVotes(address candidate) public view returns(uint256){
        uint256 votes = candidateVotes[candidate];
        require(votes > 0, "Candidate is not registered");
        return votes - 1;
    }

    function vote(address candidate) public {
        require(started == true, "Voting hasn't started or finished");
        require(voters[msg.sender] == false, "You already voted");
        uint256 votes = candidateVotes[candidate];
        require(votes > 0, "Candidate is not registered");
        candidateVotes[candidate] += 1;
        voters[msg.sender] = true;

        votes += 1;
        if (votes > winnerVotes) {
            winner = candidate;
            winnerVotes = votes;
        }
    }

    function voted() public view returns(bool) {
        return voters[msg.sender];
    }

    function currentWinner() public view returns(address) {
        require(started == true || finished == true, "Voting hasn't started");
        require(winner != address(0), "No votes has been casted");
        return winner;
    }

    function getCandidateSize() public view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 i) public view returns (address) {
        return candidates[i];
    }

}
