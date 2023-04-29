// import logo from './logo.svg';
import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
// import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

// import { fetchCandidates, Candidates, AddCandidateBox, fetchCurrentWinner} from './candidates';

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
  const provider = useEthersProvider('http://127.0.0.1:8545');
  const [contractAddress, setContractAddress] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const [signers, setSigners] = useState([]);
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");

  const votingSystem = useContract(provider, currentSignerAddress, contractAddress);

  const [selectedSigner, setSelectedSigner] = useState(currentSignerAddress);
  useEffect(() => {
    const fetchSigners = async () => {
      if (!provider) {
        setSigners([]);
        return;
      }
      // Fetch 5 first signers from the provider
      const promises = [...Array(10).keys()].map(i => provider.getSigner(i).getAddress());
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

  async function onDeployNewContract() {
    const signer = provider.getSigner(currentSignerAddress);
    const bytecode = await provider.getCode(contractAddress);
    console.log(contractABI.bytecode);
    //setContractAddress(allContracts);
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
      <div className="wider-column">
        <h3>Voting has <span className="status-indicator">{started ? "started": "not started"}</span>, you 
          <span className="status-indicator">{voted ? " have voted": " haven't voted"}</span></h3>
        <button className="action-button" onClick={onToggleVoting}>{started ? "Finish": "Start"} voting!</button>
        <form onSubmit={handleVoteSubmit}>
          <label>
            Vote for (candidate address):
            <input className="form-input" type="text" value={voteInputValue} onChange={handleVoteInputChange} />
          </label>
          <button className="action-button" type="submit">Vote</button>
        </form>
        <form onSubmit={handleAddCandidateSubmit}>
          <label>
            Add candidate address:
            <input className="form-input" type="text" value={candidateInputValue} onChange={handleCandidateInputChange} />
          </label>
          <button className="action-button" type="submit">Add</button>
        </form>
        <h3>Current candidates:</h3>
        <table className="candidate-table">
        <thead>
          <tr>
            <th>Candidate Address</th>
            <th>Number of Votes</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.address}>
              <td>{candidate.address}</td>
              <td>{candidate.votes}</td>
            </tr>
          ))}
        </tbody>
      </table>
        <h3>Current winner:</h3>
        <div className="winner-container">
          <div className="winner-address">{currentWinner}</div>
        </div>
      </div>

      <div className="narrower-column">
        <p>Network {provider.connection.url}</p>
        <h3>Identity{isOwner ? " (admin):" : ":"} </h3>
        <select value={selectedSigner} onChange={onSignerSelect}> {optionItems} </select>
        {isOwner && (<div> <button className="action-button" onClick={onDeployNewContract}>Deploy new voting system</button> </div>)}
        {errorMessage && (
          <div className="error-popup">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );

};
