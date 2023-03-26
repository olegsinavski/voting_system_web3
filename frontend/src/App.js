import logo from './logo.svg';
import './App.css';

// import { ethers } from 'ethers';
// import { Contract } from 'ethers';
// import contractABI from '../artifacts/contracts/VotingSystem.sol/VotingSystem.json';


// const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
// const contractAddress = '0x...'; // replace with your contract address
// const contract = new Contract(contractAddress, contractABI.abi, provider);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <h1>Hello, World!</h1>
        </div>
      </header>
    </div>
  );
}

export default App;
