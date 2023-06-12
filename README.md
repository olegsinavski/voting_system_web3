# Voting system Web3 App

<img width="1220" alt="Voting app demo" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/aa82ca35-f858-42b3-93d7-2736451d72a6">

Features:
 - full implementation of web3 app demoing the voting process
 - Etherium backend with a contract in Solidity 
 - Hardhat-based development evironment
 - (Hopefully) complete unittesting of the backend contract
 - Web frontend in JS with React and ethers.js 

Here is a task taken from [Calyptus](https://calyptus.co/) Web3 education platform:

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

There are two modes of testing the application: 
 - by launching the local node: faster response times and no-hassle free experimentation
 - by using public networks with metamask: realistic usage on etherium test networks or even the full deployment on the mainnet.

We are going to be running the frontend locally. Deployment of this frontend app and the public access is out of the scope for now. 

## Running a local hardhat node

Checkout the repo, `cd calyptus_capstone` and run `npm install`. After that you can run hardhat commands.
The project has many unittests that hopefully cover 100% of the functionality of the app.
To check that everything is fine, run `npx hardhat test`. You shouldn't see any failures.

Now `cd calyptus_capstone` and launch the local node with `hardhat` in a separate terminal:
``` bash
npx hardhat node
```
You should see several very rich test accounts created.

## Running the frontend

In a separate terminal, again `cd calyptus_capstone` and run:
```bash
npm start
```
This should print out something like that:
```
You can now view calyptus_capstone in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.0.14:3000
```

## Deploying a new contract

Navigate to `http://localhost:3000`. You should see the black page with the admin panel floating on the right:
<img width="811" alt="start admin panel" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/a34c1949-7baa-41d6-9bb9-c300549c12f8">

`Provider` allows you to select "local" or public "metamask" mode. Do not change it for this "local node" section.
`Select identity` selector allows you to pick one of the test accounts created by the `hardhat` node. You don't have to change it for now.

Click `Deploy new voting system` button. This deploys a new instance of the Voting contract on a local hardhat node:
<img width="1169" alt="New voting system deployed" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/e5d58dd5-6d26-4daf-8ba6-ba9a466149f7">

The idenitity used to deploy the contract becomes its "Admin". Notice that you can change your identity in the admin panel - this emulates access to this web3 app from different participants. When you select an "Admin" address, the panel displays `You are the admin` which allows the admin to perform certain extra action.

## Adding candidates

Currently, it is in a "NOT STARTED" state: people can add candidates but can not cast votes yet.
You can copy some address into `Add candidate address` box from hardhat node logs (or select some from the appearing suggestion list)
and click `Add` button. This adds the selected candidate to `Candidates` table below. Go ahead and add a few different ones:

<img width="693" alt="Added several candidates" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/1a6ebb93-a992-4732-a364-ff2bbbe27cc7">

You can add candidates using any identity in the Admin panel, but when you done select the admin address you used to deploy the contract.
This should make `Start voting!` button visible. Click this button to start the voting.

## Voting

Now the application is in the "STARTED" state. Instead of adding the candidates, you can use the `Vote for` box to vote for one of the candidates in the table:
<img width="696" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/a09b4c25-956c-40cf-a4ef-71fcfe755bc4">

Notice that one address (identity in the admin panel) can vote only once. If you attempt to vote again, an error window will appear:
<p align="center">
<img width="425" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/a5a53597-c0fe-45cc-99f1-a90f8e770f16">
 </p>

Go ahead and change idenitites few times and vote for other candidates:
<img width="696" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/7b8bec52-4a15-4b50-b81d-5e63a1108b2a">

Everytime anyone votes, the contract recomputes the current winner.

## Finish the voting

Select the admin address in the admin panel so that `Finish voting` button becomes visible and click it.

<img width="695" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/3d5cceb5-42ab-4a95-b947-b605558e4e84">

The applications is in its final "FINISHED" state. Everyone can see the winner address and the voting results.

## Running via metamask

Reload the page, select "Metamask" in the `Provider` selection combobox in the admin panel. Metamask window should pop-up asking for a connection confirmation:
<p align="center">
<img width="357" alt="metamask confirmation" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/d186770c-c76d-4261-8334-fe763794b1a7">
</p>

To demo the app, you select some test etherium network (e.g. Sepolia), although nothing stops you from deploying the contract on the main net.
Now the workflow is the same, except that for every state-writing transaction (e.g. adding a candidate) a MetaMask window will pop up to approve the gas spendature:

<img width="1265" alt="image" src="https://github.com/olegsinavski/calyptus_capstone/assets/2086260/e182ab5b-6637-4ddd-88a6-16c7193c10d8">

# Code tutorial







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
