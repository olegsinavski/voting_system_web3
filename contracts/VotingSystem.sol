// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is Ownable {
    mapping(address => uint256) public candidateVotes;
    mapping(address => bool) voters;
    uint256 public winnerVotes;
    address public winner;

    bool public started;
    bool public finished;

    // needed for the web app because we can't iterate through keys of the candidateVotes map in solidity
    address[] public candidates;

    constructor() Ownable() {}

    /**
     * @dev Starts the voting process.
     * Only the contract owner can call this function.
     */
    function startVoting() public onlyOwner {
        require(!finished, "Can't start voting second time");
        require(!started, "Can't start - voting is in progress");
        require(getCandidateSize() > 0, "Can't start with 0 candidates");
        started = true;
    }

    /**
     * @dev Finishes the voting process.
     * Only the contract owner can call this function.
     */
    function finishVoting() public onlyOwner {
        require(!finished, "Already finished");
        require(started, "Can't finish - voting hasn't started");
        started = false;
        finished = true;
    }

    /**
     * @dev Adds a new candidate to the list.
     * Only the contract owner can call this function.
     * @param candidate The address of the candidate to add.
     */
    function addCandidate(address candidate) public {
        require(candidate != address(0), "Candidate can't be null");
        require(!started, "Can't add candidate during voting");
        require(!finished, "Can't add candidate after voting is finished");
        require(candidateVotes[candidate] == 0, "Candidate is already registered");
        
        candidateVotes[candidate] = 1;
        candidates.push(candidate);
    }

    /**
     * @dev Returns the number of votes received by a candidate.
     * @param candidate The address of the candidate.
     * @return The number of votes received.
     */
    function getCandidateVotes(address candidate) public view returns (uint256) {
        uint256 votes = candidateVotes[candidate];
        require(votes > 0, "Candidate is not registered");
        return votes - 1;
    }

    /**
     * @dev Allows a voter to cast their vote for a candidate.
     * Can only be called during the voting period.
     * @param candidate The address of the candidate to vote for.
     */
    function vote(address candidate) public {
        require(candidate != address(0), "Candidate can't be null");
        require(started, "Voting hasn't started or finished");
        require(!voters[msg.sender], "You already voted");
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

    /**
     * @dev Checks if the caller has voted.
     * @return A boolean indicating whether the caller has voted or not.
     */
    function voted() public view returns (bool) {
        return voters[msg.sender];
    }

    /**
     * @dev Returns the address of the current winning candidate.
     * @return The address of the current winning candidate.
     */
    function currentWinner() public view returns (address) {
        require(started || finished, "Voting hasn't started");
        require(winner != address(0), "No votes have been casted");
        return winner;
    }

    /**
     * @dev Returns the number of candidates in the election.
     * @return The number of candidates.
     */
    function getCandidateSize() public view returns (uint256) {
        return candidates.length;
    }

    /**
     * @dev Returns the address of the candidate at the specified index.
     * @param i The index of the candidate.
     * @return The address of the candidate.
     */
    function getCandidate(uint256 i) public view returns (address) {
        return candidates[i];
    }
}
