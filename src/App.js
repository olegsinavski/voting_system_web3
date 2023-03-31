// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
// import { Contract } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
import Signers from './signers';
// import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

// function App() {
//   const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
//   provider.getSigner(0).getAddress().then(console.log);
//   provider.getSigner(1).getAddress().then(console.log);
//   const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // replace with your contract address
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


export default function App() {

  const provider = useEthersProvider('http://127.0.0.1:8545');
  console.log('rerender');

  const [count, setCount] = useState(0);

  function onClick() {
    setCount(count + 1);
    // alert("You clicked!");
  }

  const [currentSigner, setCurrentSigner] = useState("");

  if (!provider) {
    return <div> Connecting ..</div>;
  }

  return (
    <div>
      <p>Provider: {provider.connection.url}</p>
      <h3>{currentSigner}</h3>
      <Signers provider={provider} setCurrentSigner={setCurrentSigner}/>
      <MyButton count={count} onClick={onClick}/>
      <MyButton count={count} onClick={onClick}/>
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