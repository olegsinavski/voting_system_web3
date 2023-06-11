require("@nomicfoundation/hardhat-toolbox");
// require("@nomiclabs/hardhat-react");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    artifacts: "./src/artifacts",
  },
  // paths: {
  //   // ...
  //   client: './frontend/build'
  // },
  // react: {
  //   // Specify the directory where your React app will be built
  //   // This will create a new build folder inside your client directory
  //   buildDir: './frontend/build',
  //   // Specify the location of your index.html file
  //   // Specify the location of your index.js file
  //   jsEntry: './frontend/index.js',
  //   // Specify the location of your contracts
  //   contracts: './contracts',
  //   // Specify the name of your contract to use in your React components
  //   // You will need to change this to the name of your own contract
  //   contractName: 'VotingSystem'
  // }

  // react: {
  //   outputDir: "./frontend/src/contracts",
  //   solcVersion: "0.8.9",
  //   // Specify the patterns for the solidity files to include or exclude
  //   include: "./contracts/**",
  //   exclude: "./contracts/migrations/**",
  // },
};
