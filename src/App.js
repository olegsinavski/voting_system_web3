// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

function useContract(provider, contractAddress) {
  const [contract, setContract] = useState(null);
  useEffect(() => {
    console.log("Connecting to contract")
    const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
    setContract(contract);
  }, [contractAddress, provider]);
  return contract;
};


async function fetchCandidates(votingSystem) {
  if (!votingSystem) {
    console.log("No voting system yet..");
    return [];
  }
  const numberOfCandidates = await votingSystem.getCandidateSize();
  let candidateVotes = [];
  for (let index = 0; index < numberOfCandidates; index++) {
    const candidate = await votingSystem.getCandidate(index);
    const votes = await votingSystem.getCandidateVotes(candidate);
    candidateVotes.push({address: candidate, votes: votes.toString()});
  }
  console.log("Candiate votes: ", candidateVotes);
  return candidateVotes;
};


function Candidates({candidates}) {
  const candidateList = candidates.map(candidate => (
    <div key={candidate.address}>
      {candidate.address}: {candidate.votes}
    </div>
  ));
  return (<div>
    <h3>Current candidates:</h3>
    {candidateList}
  </div>);
}


function AddCandidateBox({votingSystem, onAdd}) {
  const [inputValue, setInputValue] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    console.log(inputValue);
    const tx = await votingSystem.addCandidate(inputValue);
    const response = await tx.wait();
    console.log('Add candidate response:', response);
    onAdd();
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Candidate address:
        <input type="text" value={inputValue} onChange={handleInputChange} />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}


export default function App() {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  console.log('rerender');
  const provider = useEthersProvider('http://127.0.0.1:8545');
  const votingSystem = useContract(provider, contractAddress);

  const [started, setStarted] = useState(false);
  useEffect(() => {
    refreshStarted(votingSystem);
  }, [votingSystem]);

  const [currentSigner, setCurrentSignerAddress] = useState("");

  async function refreshStarted(votingSystem) {
    if (!votingSystem) {
      console.log("No voting system yet..");
      return;
    }
    const startedValue = await votingSystem.started();
    setStarted(startedValue);
    console.log("Set started to ", startedValue);
  };


  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates(votingSystem).then(setCandidates);
  }, [votingSystem]);

  if (!provider) {
    return <div> Connecting (waiting for provider)..</div>;
  }

  if (!votingSystem) {
    return <div> Connecting (waiting for contract)..</div>;
  }

  let signedVoting = null;
  if (currentSigner !== "") {
    console.log("Signing with", currentSigner, " signer");
    signedVoting = votingSystem.connect(provider.getSigner(currentSigner));
  }

  async function onToggleVoting() {
    const tx = started ? await signedVoting.finishVoting() : await signedVoting.startVoting();
    const response = await tx.wait();
    console.log('Transaction response:', response);
    refreshStarted(votingSystem);
  }

  return (
    <div>
      <p>Provider: {provider.connection.url}</p>
      <h3>{currentSigner}</h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress}/>
      <h3> Voting: {started ? "Started": "Not started"} </h3>
      <button onClick={onToggleVoting}> 
        {started ? "Finish": "Start"} voting!
      </button>
      <AddCandidateBox votingSystem={signedVoting} onAdd={() => fetchCandidates(votingSystem).then(setCandidates)}/>
      <br/>
      <Candidates candidates={candidates} />
    </div>
  )

};
