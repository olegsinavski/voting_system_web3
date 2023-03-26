# Smart Contract
Write a smart contract that implements a voting system, with functions to
- add candidates, 
- start the voting process by admin,
- vote for a candidate, 
- end the voting process by admin,
- retrieve the number of votes for each candidate,
- retrieve the winning candidate.

Also write tests using ethers.js (or any other library of your choice) that verifies the following cases:
only the admin can start and end the voting process
once voting is done, it is reflected for the right candidate

# Frontend or Script
Create a basic frontend, which displays the candidates and the number of votes for each candidate, and allows users to vote. Connect the smart contract with the frontend using Ethers.js.
OR

Write a separate script with Ethers.js to interact with the smart contract functions.
Include a readme file.

# How to set the repo from scratch
```
npm init
npm install --save-dev hardhat
npx hardhat
```
This will install all npm and hardhat configs.

# Then, if you check it out you should run
```
npm install
```

# After that you can run hardhat commands

```
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js
npx hardhat node
```

# Create frontend

```
npx create-react-app frontend
cd frontend
npm install @ethersproject/providers
npm install @openzeppelin/contracts
npm install web3modal
npm install @walletconnect/web3-provider
```