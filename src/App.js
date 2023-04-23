// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

// function App() {
//   const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
//   provider.getSigner(0).getAddress().then(console.log);
//   provider.getSigner(1).getAddress().then(console.log);
//   const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
//   const votingSystem = new Contract(contractAddress, contractABI.abi, provider);

//   const [started, setStarted] = useState(false);
//   useEffect(() => {
//     const fetchStarted = async () => {
//       const startedValue = await votingSystem.started();
//       setStarted(startedValue);
//     };
//     fetchStarted();
//   }, []);

//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <div>
//           <h1>{started ? 'Contract has started' : 'Contract has not started'}</h1>
//         </div>
//       </header>
//     </div>
//   );
// }

function useContract(provider, contractAddress) {
  const [contract, setContract] = useState(null);
  useEffect(() => {
    console.log("Connecting to contract")
    const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
    setContract(contract);
  }, [contractAddress, provider]);
  return contract;
};


export default function App() {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  console.log('rerender');
  const provider = useEthersProvider('http://127.0.0.1:8545');
  const votingSystem = useContract(provider, contractAddress);

  const [started, setStarted] = useState(false);
  useEffect(() => {
    const fetchStarted = async () => {
      if (!votingSystem) {
        console.log("No voting system yet..");
        return;
      }
      const startedValue = await votingSystem.started();
      setStarted(startedValue);
      console.log("Set started to ", startedValue);
    };
    fetchStarted();
  }, [votingSystem]);

  async function onStartVoting() {
    // TODO::
  }

  const [currentSigner, setCurrentSignerAddress] = useState("");

  if (!provider) {
    return <div> Connecting ..</div>;
  }

  return (
    <div>
      <p>Provider: {provider.connection.url}</p>
      <h3>{currentSigner}</h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress}/>
      <h3> Voting: {started ? "Started": "Not started"} </h3>
      <button onClick={onStartVoting}> 
        Start voting!
      </button>
      <br/>
    </div>
  )

};


function MyButton({ count, onClick }) {
  return (
    <button onClick={onClick}> 
      Clicked {count} times
    </button>
  );
}