# Voting system Web3 App

<p align="center">
  <img width="1220" alt="Voting app demo" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/aa82ca35-f858-42b3-93d7-2736451d72a6">
</p>

Features:
- Full implementation of a web3 app demonstrating the voting process.
- Ethereum backend with a contract in Solidity.
- Hardhat-based development evironment
- (Hopefully) Complete unit testing of the backend contract.
- Web frontend in JavaScript using React and ethers.js.

Here is a task description taken from the [Calyptus](https://calyptus.co/) Web3 education platform.


```
## Smart Contract
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

## Frontend or Script
Create a basic frontend, which displays the candidates and the number of votes for each candidate, and allows users to vote. Connect the smart contract with the frontend using Ethers.js.
OR
Write a separate script with Ethers.js to interact with the smart contract functions.
Include a readme file.
```

# Web app tutorial 

There are two modes available for testing the application:
 - Launching the local node: This mode provides faster response times and allows hassle and money-free experimentation.
 - Using public networks with MetaMask: This mode enables realistic usage on Ethereum test networks or even the full deployment on the mainnet.

We will be running the frontend locally. The deployment of this frontend app and public access are out of the scope for now.

## Setup the repo

Clone the repository by running the following command:
  ```bash
  git clone https://github.com/olegsinavski/calyptus_capstone
  ```

Change to the project directory:
  ```bash
  cd calyptus_capstone
  ```

Install the required dependencies using npm:
  ```bash
  npm install
  ```

To run the project's unit tests and ensure everything is functioning correctly, run the following:
  ```bash
  npx hardhat test
  ```

## Running a local hardhat node

Launch a local Ethereum node using Hardhat in a separate terminal:
```bash
npx hardhat node
```

This will start the local node, and you should see the creation of several test accounts with preloaded funds.

## Running the frontend

In a separate terminal, again `cd calyptus_capstone` and run:
```bash
npm start
```
This should print out something like this:
```
You can now view calyptus_capstone in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.0.14:3000
```

## Deploying a new contract

To deploy a new contract, follow these steps:

Open your web browser and navigate to http://localhost:3000. You will see a black page with the admin panel floating on the right-hand side.
<p align="center">
  <img width="811" alt="start admin panel" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/a34c1949-7baa-41d6-9bb9-c300549c12f8">
</p>

In the admin panel, locate the Provider dropdown menu. It allows you to select between "local" and public "Metamask". Do not change it for this "local node" tutorial.
Next, find the Select identity selector in the admin panel. This allows you to choose one of the test accounts created by the hardhat node. For now, there is no need to change this selection.

Click on the "Deploy new voting system" button. This action will deploy a new instance of the Voting contract on a local hardhat node.
<p align="center">
  <img width="1169" alt="New voting system deployed" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/e5d58dd5-6d26-4daf-8ba6-ba9a466149f7">
</p>


The identity used to deploy the contract will become its "Admin". Note that you can change your identity in the admin panel, which simulates access to this web3 app from different participants. When you select an "Admin" address, the panel will display the message "You are the admin", providing the admin with certain additional actions they can perform.

## Adding candidates

The current state of the system is "NOT STARTED," which means people can add candidates but cannot cast votes yet. Follow these steps to add candidates:
Locate the "Add candidate address" box in the Admin panel. You can copy an address from the hardhat node logs or select one from the suggested list that appears.

Paste the candidate's address into the "Add candidate address" box and click the "Add" button. This will add the selected candidate to the "Candidates" table below. Feel free to add several different candidates.

<p align="center">
<img width="693" alt="Added several candidates" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/1a6ebb93-a992-4732-a364-ff2bbbe27cc7">
</p>

You can add candidates using any identity in the Admin panel. However, once you are done, select the admin address you used to deploy the contract. This action will make the "Start voting!" button visible.
Click the "Start voting!" button to begin the voting process.

## Voting

The application is now in the "STARTED" state. Instead of adding candidates, you can use the "Vote for" box to cast your vote for one of the candidates in the table:
<p align="center">
<img width="696" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/a09b4c25-956c-40cf-a4ef-71fcfe755bc4">
</p>

Please note that each address (identity in the admin panel) can vote only once. If you attempt to vote again, an error window will appear:
<p align="center">
<img width="425" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/a5a53597-c0fe-45cc-99f1-a90f8e770f16">
</p>

Feel free to change identities a few times and vote for different candidates:
<p align="center">
<img width="696" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/7b8bec52-4a15-4b50-b81d-5e63a1108b2a">
</p>

Every time a vote is cast, the contract will recompute the current winner.

## Finish the voting

To complete the voting process, follow these steps:
In the admin panel, select the admin address. This action will make the "Finish voting" button visible.

<p align="center">
<img width="695" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/3d5cceb5-42ab-4a95-b947-b605558e4e84">
</p>

Click the "Finish voting" button.

The application will transition to the final "FINISHED" state. At this point, everyone can view the winner's address and the voting results.

## Running via metamask

To run the application using Metamask, follow these steps:

Reload the page and select "Metamask" from the Provider selection dropdown in the admin panel. A Metamask window will pop up, asking for confirmation to connect with your identity:

<p align="center">
<img width="357" alt="metamask confirmation" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/d186770c-c76d-4261-8334-fe763794b1a7">
</p>

To demonstrate the app, you can select a test Ethereum network (e.g., Sepolia). However, if desired, you can also deploy the contract on the mainnet.

The workflow remains the same, except that for each state-writing transaction (e.g., adding a candidate), a Metamask window will pop up to approve the gas expenditure.

<p align="center">
<img width="1265" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/e182ab5b-6637-4ddd-88a6-16c7193c10d8">
</p>

# Code structure

## Voting system contract

The contract that handles the voting logic is located at `contracts/VotingSystem.sol`. This contract contains the necessary information required to implement the voting process:

 - It keeps track of the state of the voting process using `started/finished` flags.
 - The contract maintains a mapping called `candidateVotes` to track the votes received by each candidate.
 - To ensure that each voter can only vote once, the contract keeps a record of `voters`.
 - The contract efficiently recomputes and stores the winner on every vote using `winnerVotes` and `winner` variables.
 - Additionally, the `candidates` are stored separately to facilitate visualization since it is not possible to iterate through the keys of the `candidateVotes` mapping in Solidity.

The voting logic implemented in the contract is straightforward and easy to understand.

## Voting System Tests

All backend tests for the voting system can be found in `test/VotingSystem.js`. These tests utilize `hardhat` and `chai` to cover various aspects of the contracts and explore different scenarios and edge cases.

Some interesting edge cases that are tested include:

- Can an admin start voting without any candidates? (I opted for "no" - the voting cannot start without any candidates.)
- How should the system handle cases where the number of votes is equal? (Currently, the candidate who received the first vote is declared the winner in such cases. But its probably better to randomize this.)
- Is it possible to finish the voting without any votes? (Yes, it is possible, but the winner will be `nil` since no votes were cast.)
- Can the voting be restarted after it is already done? (No, the voting cannot be restarted. If you want to conduct another round of voting, you need to create a new contract. Each voting process must be preserved for eternity!)


## Frontend code

The code is in `src`. I haven't had any experience with React before, so don't judge me too harshly. Also I haven't really used javascript much before.
In fact, learning React and writing the frontend took me 90% of the development time for this project:)

I tried to extract React components and carefully use state functors in React, but I'm not yet quite happy about the code structure:
 - it is still too convoluted for my taste (state goes all over the place)
 - there is no very clear separation between GUI and the logic really (but maybe this is how its supposed to be done here?)
 - and finally, the major flaw is that there are no front end tests :(

# Misc HOW-TOs
## Basic hardhat commands

### Run hardhat node
```
npx hardhat node
```
### Deploy the contract
```
npx hardhat run scripts/deploy.js --network localhost
```
### Run the frontend
```
npm start
```
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

## How to set the repo from scratch
```
npm init
npm install --save-dev hardhat
npx hardhat
```
This will install all npm and hardhat configs. But if you're checking out this repo you should only run:
```
npm install
```
## Create frontend
How to add a frontend from scratch
```
npx create-react-app frontend
cd frontend

npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers

npm install @ethersproject/providers @openzeppelin/contracts
```
