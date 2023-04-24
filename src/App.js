// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

import { fetchCandidates, Candidates, AddCandidateBox} from './candidates';

function useContract(provider, contractAddress) {
  const [contract, setContract] = useState(null);
  useEffect(() => {
    console.log("Connecting to contract")
    const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
    setContract(contract);
  }, [contractAddress, provider]);
  return contract;
};


export function VoteBox({ votingSystem, onVote }) {
  const [inputValue, setInputValue] = useState('');

  async function handleSubmit(event) {
      event.preventDefault();
      console.log(inputValue);
      const tx = await votingSystem.vote(inputValue);
      const response = await tx.wait();
      console.log('Voting response:', response);
      onVote();
  };

  const handleInputChange = (event) => {
      setInputValue(event.target.value);
  };

  return (
      <form onSubmit={handleSubmit}>
          <label>
              Vot for (candidate address):
              <input type="text" value={inputValue} onChange={handleInputChange} />
          </label>
          <button type="submit">Vote</button>
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

  const [voted, setVoted] = useState(false);
  useEffect(() => {
    refreshVoted(votingSystem);
  }, [votingSystem]);

  async function refreshVoted(votingSystem) {
    if (!votingSystem) {
      console.log("No voting system yet..");
      return;
    }
    const votedValue = await votingSystem.voted();
    setVoted(votedValue);
    console.log("Set voted to ", votedValue);
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
      <h3>You are {currentSigner}</h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress}/>
      <h3> Voting: {started ? "Started": "Not started"}; You {voted ? "voted": "not voted"}</h3>
      <button onClick={onToggleVoting}> 
        {started ? "Finish": "Start"} voting!
      </button>
      <VoteBox votingSystem={signedVoting} onVote={() => refreshVoted(votingSystem)}/>
      <AddCandidateBox votingSystem={signedVoting} onAdd={() => fetchCandidates(votingSystem).then(setCandidates)}/>
      <br/>
      <Candidates candidates={candidates} />
    </div>
  )

};
