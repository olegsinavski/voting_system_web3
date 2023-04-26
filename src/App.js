// import logo from './logo.svg';
import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
// import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

// import { fetchCandidates, Candidates, AddCandidateBox, fetchCurrentWinner} from './candidates';

import styled from 'styled-components';
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;


const StyledButton = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;


const StyledInput = styled.input`
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  padding: 0.5rem;
`;

function validateAddress(address) {
  try {
    ethers.utils.getAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}

function txErrorToHumanReadable(error) {
  const message = error.error.error.data.message;
  return message.split("reverted with reason string '")[1].slice(0, -1);
}

export async function fetchCandidates(votingSystem) {
  if (!votingSystem) {
      return [];
  }
  const numberOfCandidates = await votingSystem.getCandidateSize();
  let candidateVotes = [];
  for (let index = 0; index < numberOfCandidates; index++) {
      const candidate = await votingSystem.getCandidate(index);
      const votes = await votingSystem.getCandidateVotes(candidate);
      candidateVotes.push({ address: candidate, votes: votes.toString() });
  }
  return candidateVotes;
};


export async function fetchCurrentWinner(votingSystem) {
  if (!votingSystem) {
      return [];
  }
  return await votingSystem.currentWinner();
};


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
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
    setContract(contract);
  }, [provider, signerAddress, contractAddress]);
  return contract;
};



export default function App() {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const provider = useEthersProvider('http://127.0.0.1:8545');

  const [currentSignerAddress, setCurrentSignerAddress] = useState("");

  const votingSystem = useContract(provider, currentSignerAddress, contractAddress);

  const [signers, setSigners] = useState([]);
  const [selectedSigner, setSelectedSigner] = useState(currentSignerAddress);
  useEffect(() => {
    const fetchSigners = async () => {
      if (!provider) {
        setSigners([]);
        return;
      }
      // Fetch 5 first signers from the provider
      const promises = [...Array(5).keys()].map(i => provider.getSigner(i).getAddress());
      const results = await Promise.all(promises);
      setSigners(results);
      setCurrentSignerAddress(results[0]);
      setSelectedSigner(results[0]);
    };
    fetchSigners();
  }, [provider]);

  const [started, setStarted] = useState(false);
  useEffect(() => {
    refreshStarted(votingSystem);
  }, [votingSystem]);

  async function refreshStarted(votingSystem) {
    if (!votingSystem) {
      return;
    }
    const startedValue = await votingSystem.started();
    setStarted(startedValue);
  };

  const [voted, setVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [currentWinner, setCurrentWinner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage]);

  function refreshAllVoting(votingSystem, started) {
    if (!votingSystem) {
      return;
    }
    votingSystem.voted().then(setVoted);
    fetchCandidates(votingSystem).then(setCandidates);
    if (started) {
      fetchCurrentWinner(votingSystem).then(setCurrentWinner);
    } else {
      setCurrentWinner("");
    }
    
  }

  useEffect(() => {
    const refreshOwner = async () => {
      if (!votingSystem) {
        return;
      }
      const ownerAddress = await votingSystem.owner();
      setIsOwner(ownerAddress === currentSignerAddress);
    }
    refreshOwner();
  }, [votingSystem, currentSignerAddress]);

  useEffect(() => {
    refreshAllVoting(votingSystem, started);
  }, [votingSystem, started]);

  const [candidateInputValue, setCandidateInputValue] = useState('');

  const [voteInputValue, setVoteInputValue] = useState('');

  const optionItems = signers.map(s => 
    <option key={s} value={s}>{s}</option>
  );

  if (!provider) {
    return <div> Connecting (waiting for provider)..</div>;
  }

  if (!votingSystem) {
    return (<div>
      <p>Provider: {provider.connection.url}</p>
      <h3>You are {currentSignerAddress} </h3>
      <select value={selectedSigner} onChange={onSignerSelect}> {optionItems} </select>
    </div>);
  }

  function onSignerSelect(event) {
    setCurrentSignerAddress(event.target.value);
    setSelectedSigner(event.target.value);
  }

  async function onToggleVoting() {
    try {
      const tx = started ? await votingSystem.finishVoting() : await votingSystem.startVoting();
      const response = await tx.wait();
      console.log('Transaction response:', response);
    } catch (error) {
      console.log(error)
      setErrorMessage(txErrorToHumanReadable(error));
    } 
    refreshStarted(votingSystem);
  }

  async function handleAddCandidateSubmit(event) {
    event.preventDefault();
    if (!validateAddress(candidateInputValue)) {
      setErrorMessage('Invalid candidate address - should be full address');
      return;
    }
    try {
        const tx = await votingSystem.addCandidate(candidateInputValue);
        const response = await tx.wait();
        console.log('Add candidate response:', response);
    } catch(error) {
        console.log(error)
        setErrorMessage(txErrorToHumanReadable(error));
    }
    fetchCandidates(votingSystem).then(setCandidates)
  };

  const handleCandidateInputChange = (event) => {
      setCandidateInputValue(event.target.value);
  };

  async function handleVoteSubmit(event) {
    event.preventDefault();
    if (!validateAddress(voteInputValue)) {
      setErrorMessage('Invalid vote address - should be full address');
      return;
    }
    try {
      const tx = await votingSystem.vote(voteInputValue);
      const response = await tx.wait();
      console.log('Voting response:', response);
    } catch(error) {
      console.log(error)
      setErrorMessage(txErrorToHumanReadable(error));
    }
      refreshAllVoting(votingSystem)
  };

  const handleVoteInputChange = (event) => {
    setVoteInputValue(event.target.value);
  };

  const candidateList = candidates.map(candidate => (
    <div key={candidate.address}>
        {candidate.address}: {candidate.votes}
    </div>
  ));

  return (
    <div>
    <div className="container">
      <div className="column">
        <h3> Voting: {started ? "Started": "Not started"}</h3>
        <h3> You {voted ? "have voted": "haven't voted"}</h3>
        <button onClick={onToggleVoting}> 
          {started ? "Finish": "Start"} voting!
        </button>
        <form onSubmit={handleVoteSubmit}>
          <label>
            Vote for (candidate address):
            <input type="text" value={voteInputValue} onChange={handleVoteInputChange} />
          </label>
          <button type="submit">Vote</button>
        </form>
        <form onSubmit={handleAddCandidateSubmit}>
          <label>
            Add candidate address:
            <input type="text" value={candidateInputValue} onChange={handleCandidateInputChange} />
          </label>
          <button type="submit">Add</button>
        </form>
        <h3>Current candidates:</h3>
          {candidateList}
        <h3> Current winner is {currentWinner}</h3>
      </div>

      <div className="column">
        {errorMessage && (
          <div className="error-popup">
            <p>{errorMessage}</p>
          </div>
        )}
        <p>Network {provider.connection.url}</p>
        <h3>Identity{isOwner ? " (admin):" : ":"} </h3>
        <select value={selectedSigner} onChange={onSignerSelect}> {optionItems} </select>
      </div>
    </div>
    </div>
  );

};
