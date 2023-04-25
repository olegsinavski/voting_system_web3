// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

import { fetchCandidates, Candidates, AddCandidateBox, fetchCurrentWinner} from './candidates';


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

function useContract(provider, signerAddress, contractAddress) {
  const [contract, setContract] = useState(null);
  useEffect(() => {
    if (!provider) {
      setContract(null);
      return;
    }
    if (!signerAddress) {
      setContract(null);
      return;
    }
    const signer = provider.getSigner(signerAddress);
    console.log("Connecting to contract")
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
    setContract(contract);
  }, [provider, signerAddress, contractAddress]);
  return contract;
};



export default function App() {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  console.log('rerender');
  const provider = useEthersProvider('http://127.0.0.1:8545');

  const [currentSignerAddress, setCurrentSignerAddress] = useState("");

  const votingSystem = useContract(provider, currentSignerAddress, contractAddress);

  const [started, setStarted] = useState(false);
  useEffect(() => {
    refreshStarted(votingSystem);
  }, [votingSystem]);

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

  const [candidates, setCandidates] = useState([]);
  const [currentWinner, setCurrentWinner] = useState("");

  function refreshAllVoting(votingSystem) {
    if (!votingSystem) {
      console.log("No voting system yet..");
      return;
    }
    votingSystem.voted().then(setVoted);
    fetchCandidates(votingSystem).then(setCandidates);
    fetchCurrentWinner(votingSystem).then(setCurrentWinner);
  }

  useEffect(() => {
    refreshAllVoting(votingSystem);
  }, [votingSystem]);


  if (!provider) {
    return <div> Connecting (waiting for provider)..</div>;
  }

  if (!votingSystem) {
    return (<div>
      <p>Provider: {provider.connection.url}</p>
      <h3>You are {currentSignerAddress}</h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress}/>
    </div>);
  }

  async function onToggleVoting() {
    const tx = started ? await votingSystem.finishVoting() : await votingSystem.startVoting();
    const response = await tx.wait();
    console.log('Transaction response:', response);
    refreshStarted(votingSystem);
  }


  return (
    <div>
      <p>Provider: {provider.connection.url}</p>
      <h3>You are {currentSignerAddress}</h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress}/>
      <h3> Voting: {started ? "Started": "Not started"}</h3>
      <h3> You {voted ? "have voted": "haven't voted"}</h3>
      <button onClick={onToggleVoting}> 
        {started ? "Finish": "Start"} voting!
      </button>
      <VoteBox votingSystem={votingSystem} onVote={() => refreshAllVoting(votingSystem)}/>
      <AddCandidateBox votingSystem={votingSystem} onAdd={() => fetchCandidates(votingSystem).then(setCandidates)}/>
      <br/>
      <Candidates candidates={candidates} winner={currentWinner} />
    </div>
  )

};
