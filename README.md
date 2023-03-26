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

npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers

npm install @ethersproject/providers @openzeppelin/contracts
```

## Run hardhat node
```
npx hardhat node
```
## Deploy the contract
```
npx hardhat run scripts/deploy.js --network localhost
```
## Run the frontend
```
npm start
```


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`