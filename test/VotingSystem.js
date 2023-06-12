const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("VotingSystem", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVotingSystem() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();

    return { votingSystem, owner, otherAccount, thirdAccount };
  }

  async function getCandidates(votingSystem) {
    const numberOfCandidates = await votingSystem.getCandidateSize();
    const candidates = await Promise.all(
      Array.from({ length: numberOfCandidates }, (_, index) =>
        votingSystem.getCandidate(index)
      )
    );
    return candidates;
  }

  describe("State transition", function () {
    it("Should set the right owner", async function () {
      const { votingSystem, owner } = await loadFixture(deployVotingSystem);

      expect(await votingSystem.owner()).to.equal(owner.address);
    });

    it("Can't start with empty candidates", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);

      await expect(votingSystem.startVoting()).to.be.revertedWith(
          "Can't start with 0 candidates"
      );
    });

    it("Starting and stopping voting", async function () {
      const { votingSystem, owner, anotherAccount } = await loadFixture(deployVotingSystem);
      expect(await votingSystem.started()).to.equal(false);
      expect(await votingSystem.finished()).to.equal(false);
      await expect(votingSystem.addCandidate(owner.address)).not.to.be.reverted;

      await expect(votingSystem.finishVoting()).to.be.revertedWith(
          "Can't finish - voting hasn't started"
      );

      await expect(votingSystem.startVoting()).not.to.be.reverted;
      expect(await votingSystem.started()).to.equal(true);

      await expect(votingSystem.startVoting()).to.be.revertedWith(
          "Can't start - voting is in progress"
      );

      await expect(votingSystem.finishVoting()).not.to.be.reverted;
      expect(await votingSystem.started()).to.equal(false);
      expect(await votingSystem.finished()).to.equal(true);

      await expect(votingSystem.startVoting()).to.be.revertedWith(
          "Can't start voting second time"
      );
      await expect(votingSystem.finishVoting()).to.be.revertedWith(
          "Already finished"
      );
      expect(await votingSystem.started()).to.equal(false);

    });

    it("Can't start and stop from another account", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;

      await expect(votingSystem.connect(otherAccount).startVoting()).to.be.revertedWith(
          "Ownable: caller is not the owner"
      );

      await expect(votingSystem.startVoting()).not.to.be.reverted;
      expect(await votingSystem.started()).to.equal(true);

      await expect(votingSystem.connect(otherAccount).finishVoting()).to.be.revertedWith(
          "Ownable: caller is not the owner"
      );

    });


  });

  describe("Voting", function() {
    it("Add candidates", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.addCandidate(otherAccount.address)).to.be.revertedWith(
        "Can't add candidate during voting"
      );

      await expect(votingSystem.finishVoting()).not.to.be.reverted;

      await expect(votingSystem.addCandidate(otherAccount.address)).to.be.revertedWith(
        "Can't add candidate after voting is finished"
      );
        
      expect(await getCandidates(votingSystem)).to.be.deep.equal([otherAccount.address]);

    });

    it("Add null candidate", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      await expect(votingSystem.addCandidate(ethers.constants.AddressZero)).to.be.revertedWith(
        "Candidate can't be null"
      );
    });


    it("Can't add two times", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;

      await expect(votingSystem.addCandidate(otherAccount.address)).to.be.revertedWith(
        "Candidate is already registered"
      );
    });

    it("Casting votes", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;

      expect(await votingSystem.getCandidateVotes(otherAccount.address)).to.equal(0);
      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.vote(otherAccount.address)).not.to.be.reverted;
      expect(await votingSystem.getCandidateVotes(otherAccount.address)).to.equal(1);

      await expect(votingSystem.vote(otherAccount.address)).to.be.revertedWith(
        "You already voted"
      );

      await expect(votingSystem.connect(otherAccount).vote(otherAccount.address)).not.to.be.reverted;
      expect(await votingSystem.getCandidateVotes(otherAccount.address)).to.equal(2);

      await expect(votingSystem.connect(otherAccount).vote(otherAccount.address)).to.be.revertedWith(
        "You already voted"
      );

    });

    it("Voting for null", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      await expect(votingSystem.addCandidate(owner.address)).not.to.be.reverted;
      await expect(votingSystem.startVoting()).not.to.be.reverted;
      await expect(votingSystem.vote(ethers.constants.AddressZero)).to.be.revertedWith(
        "Candidate can't be null"
      );
    });


    it("Voting for non-existent", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      await expect(votingSystem.addCandidate(owner.address)).not.to.be.reverted;
      await expect(votingSystem.startVoting()).not.to.be.reverted;
      await expect(votingSystem.vote(otherAccount.address)).to.be.revertedWith(
        "Candidate is not registered"
      );

      await expect(votingSystem.getCandidateVotes(otherAccount.address)).to.be.revertedWith(
        "Candidate is not registered"
      );

      // Null candidate shouldn't exist as well
      await expect(votingSystem.getCandidateVotes(ethers.constants.AddressZero)).to.be.revertedWith(
        "Candidate is not registered"
      );

    });

    it("Voting and states", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.vote(otherAccount.address)).to.be.revertedWith(
        "Voting hasn't started or finished"
      );

      await expect(votingSystem.startVoting()).not.to.be.reverted;
      await expect(votingSystem.finishVoting()).not.to.be.reverted;

      await expect(votingSystem.vote(otherAccount.address)).to.be.revertedWith(
        "Voting hasn't started or finished"
      );
    });

    it("Two candidates", async function () {
      const { votingSystem, owner, otherAccount, thirdAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.connect(otherAccount).addCandidate(owner.address)).not.to.be.reverted;
      expect(await getCandidates(votingSystem)).to.be.deep.equal([otherAccount.address, owner.address]);

      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.vote(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.connect(otherAccount).vote(owner.address)).not.to.be.reverted;
      await expect(votingSystem.connect(thirdAccount).vote(owner.address)).not.to.be.reverted;

      expect(await votingSystem.getCandidateVotes(otherAccount.address)).to.equal(1);
      expect(await votingSystem.getCandidateVotes(owner.address)).to.equal(2);
    });

  });

  describe("Winners", function() {

    it("Getting winner", async function () {
      const { votingSystem, owner, otherAccount, thirdAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;

      await expect(votingSystem.currentWinner()).to.be.revertedWith(
        "Voting hasn't started"
      );
    
      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.vote(otherAccount.address)).not.to.be.reverted;

      expect(await votingSystem.currentWinner()).to.equal(otherAccount.address);
      await expect(votingSystem.finishVoting()).not.to.be.reverted;
      expect(await votingSystem.currentWinner()).to.equal(otherAccount.address);

    }); 

    it("Getting winner - no votes", async function () {
      const { votingSystem, owner, otherAccount, thirdAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;

      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.currentWinner()).to.be.revertedWith(
        "No votes have been casted"
      );

      await expect(votingSystem.finishVoting()).not.to.be.reverted;

      await expect(votingSystem.currentWinner()).to.be.revertedWith(
        "No votes have been casted"
      );
    });
    
    it("Two candidates", async function () {
      const { votingSystem, owner, otherAccount, thirdAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.connect(otherAccount).addCandidate(owner.address)).not.to.be.reverted;

      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.connect(thirdAccount).vote(owner.address)).not.to.be.reverted;
      await expect(votingSystem.vote(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.connect(otherAccount).vote(owner.address)).not.to.be.reverted;
      
      expect(await votingSystem.currentWinner()).to.equal(owner.address);

      await expect(votingSystem.finishVoting()).not.to.be.reverted;

      expect(await votingSystem.currentWinner()).to.equal(owner.address);

    }); 


    it("Tie - goes to the first", async function () {
      const { votingSystem, owner, otherAccount, thirdAccount } = await loadFixture(deployVotingSystem);
      
      await expect(votingSystem.addCandidate(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.connect(otherAccount).addCandidate(owner.address)).not.to.be.reverted;

      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.vote(otherAccount.address)).not.to.be.reverted;
      await expect(votingSystem.connect(thirdAccount).vote(owner.address)).not.to.be.reverted;

      expect(await votingSystem.currentWinner()).to.equal(otherAccount.address);

      await expect(votingSystem.finishVoting()).not.to.be.reverted;

      expect(await votingSystem.currentWinner()).to.equal(otherAccount.address);

    }); 

  });

});
