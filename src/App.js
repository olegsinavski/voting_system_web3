// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
// import { Contract } from 'ethers';
// import { useState, useEffect } from 'react';
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


import { useEffect, useState } from 'react';


const products = [
  {title: "Cabbage", id: 1},
  {title: "Apples", id: 2},
  {title: "Oranges", id: 3},
];


export default function App() {

  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

  const [count, setCount] = useState(0);

  function onClick() {
    setCount(count + 1);
    // alert("You clicked!");
  }

  const [signers, setSigners] = useState([]);
  useEffect(() => {
    const fetchSigners = async () => {
      // Fetch 5 first signers from the provider
      const promises = [...Array(5).keys()].map(i => provider.getSigner(i).getAddress());
      const results = await Promise.all(promises);
      setSigners(results);
    };
    fetchSigners();
  });

  const listItems = signers.map(s => 
    <li 
      key={s}
      >
      {s}
    </li>
  );

  const optionItems = signers.map(s => 
    <option key={s} value={s}>{s}</option>
  );

  return (
    <div>
      <ul>{listItems}</ul>
      <MyButton count={count} onClick={onClick}/>
      <MyButton count={count} onClick={onClick}/>
      <br/>
      <select> {optionItems} </select>
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