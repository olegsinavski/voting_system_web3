// import logo from './logo.svg';
// import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import useEthersProvider from './ethersProvider';
// import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

// import { fetchCandidates, Candidates, AddCandidateBox, fetchCurrentWinner} from './candidates';



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


export function Candidates({ candidates, winner }) {
  const candidateList = candidates.map(candidate => (
      <div key={candidate.address}>
          {candidate.address}: {candidate.votes}
      </div>
  ));
  return (<div>
      <h3>Current candidates:</h3>
      {candidateList}
      <h2> Current winner is {winner}</h2>
  </div>);
}


export function AddCandidateBox({ votingSystem, onAdd, setErrorMessage }) {
  const [inputValue, setInputValue] = useState('');

  async function handleSubmit(event) {
      event.preventDefault();
      try {
          const tx = await votingSystem.addCandidate(inputValue);
          const response = await tx.wait();
          console.log('Add candidate response:', response);
      } catch(error) {
          console.log(error)
          setErrorMessage(error.error.error.data.message);
      }
      onAdd();
  };

  const handleInputChange = (event) => {
      setInputValue(event.target.value);
  };

  return (
      <form onSubmit={handleSubmit}>
          <label>
              Add candidate address:
              <input type="text" value={inputValue} onChange={handleInputChange} />
          </label>
          <button type="submit">Add</button>
      </form>
  );
}

export function Signers({provider, setCurrentSignerAddress, initialValue}) {

  const [signers, setSigners] = useState([]);
  const [selectedSigner, setSelectedSigner] = useState('');
  useEffect(() => {
    const fetchSigners = async () => {
      // Fetch 5 first signers from the provider
      const promises = [...Array(5).keys()].map(i => provider.getSigner(i).getAddress());
      const results = await Promise.all(promises);
      setSigners(results);
      setCurrentSignerAddress(results[0]);
      setSelectedSigner(initialValue);
    };
    fetchSigners();
  }, [provider, setCurrentSignerAddress]);

  const optionItems = signers.map(s => 
    <option key={s} value={s}>{s}</option>
  );

  function onSignerSelect(event) {
    setCurrentSignerAddress(event.target.value);
    setSelectedSigner(event.target.value);
  }

  return (
    <div>
      <select value={selectedSigner} onChange={onSignerSelect}> {optionItems} </select>
    </div>
  )
}

export function VoteBox({ votingSystem, onVote,  setErrorMessage}) {
  const [inputValue, setInputValue] = useState('');

  async function handleSubmit(event) {
      event.preventDefault();
      try {
        const tx = await votingSystem.vote(inputValue);
        const response = await tx.wait();
        console.log('Voting response:', response);
      } catch(error) {
        console.log(error)
        setErrorMessage(error.error.error.data.message);
      }
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


  if (!provider) {
    return <div> Connecting (waiting for provider)..</div>;
  }

  if (!votingSystem) {
    return (<div>
      <p>Provider: {provider.connection.url}</p>
      <h3>You are {currentSignerAddress} </h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress}/>
    </div>);
  }

  async function onToggleVoting() {
    try {
      const tx = started ? await votingSystem.finishVoting() : await votingSystem.startVoting();
      const response = await tx.wait();
      console.log('Transaction response:', response);
    } catch (error) {
      console.log(error)
      setErrorMessage(error.error.error.data.message);
    } 
    refreshStarted(votingSystem);
  }


  return (
    <div>
      {errorMessage && (
        <div className="error-popup">
          <p>{errorMessage}</p>
        </div>
      )}
      <p>Provider: {provider.connection.url}</p>
      <h3>You are {currentSignerAddress} {isOwner ? "(admin)" : ""} </h3>
      <Signers provider={provider} setCurrentSignerAddress={setCurrentSignerAddress} initialValue={currentSignerAddress}/>
      <h3> Voting: {started ? "Started": "Not started"}</h3>
      <h3> You {voted ? "have voted": "haven't voted"}</h3>
      <button onClick={onToggleVoting}> 
        {started ? "Finish": "Start"} voting!
      </button>
      <VoteBox votingSystem={votingSystem} onVote={() => refreshAllVoting(votingSystem)} setErrorMessage={setErrorMessage}/>
      <AddCandidateBox votingSystem={votingSystem} onAdd={() => fetchCandidates(votingSystem).then(setCandidates)} setErrorMessage={setErrorMessage}/>
      <br/>
      <Candidates candidates={candidates} winner={currentWinner} />
    </div>
  )

};
