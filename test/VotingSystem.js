const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("VotingSystem", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVotingSystem() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();

    return { votingSystem, owner, otherAccount };
  }

  describe("State transition", function () {
    it("Should set the right owner", async function () {
      const { votingSystem, owner } = await loadFixture(deployVotingSystem);

      expect(await votingSystem.owner()).to.equal(owner.address);
    });

    it("Starting and stopping voting", async function () {
      const { votingSystem, owner, anotherAccount } = await loadFixture(deployVotingSystem);
      expect(await votingSystem.started()).to.equal(false);
      expect(await votingSystem.finished()).to.equal(false);

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
      await expect(votingSystem.connect(otherAccount).addCandidate(owner.address)).not.to.be.reverted;

      await expect(votingSystem.startVoting()).not.to.be.reverted;

      await expect(votingSystem.addCandidate(otherAccount.address)).to.be.revertedWith(
        "Can't add candidate during voting"
      );

      await expect(votingSystem.finishVoting()).not.to.be.reverted;

      await expect(votingSystem.addCandidate(otherAccount.address)).to.be.revertedWith(
        "Can't add candidate after voting is finished"
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


    it("Voting for non-existent", async function () {
      const { votingSystem, owner, otherAccount } = await loadFixture(deployVotingSystem);
      await expect(votingSystem.startVoting()).not.to.be.reverted;
      await expect(votingSystem.vote(otherAccount.address)).to.be.revertedWith(
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

    


  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
