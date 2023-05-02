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
    if (!contractAddress) {
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
  const [contractAddress, setContractAddress] = useState("");
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
  const [finished, setFinished] = useState(false);

  async function refreshStartedFinished(votingSystem) {
    if (!votingSystem) {
      return;
    }
    const startedValue = await votingSystem.started();
    const finishedValue = await votingSystem.finished();
    setStarted(startedValue);
    setFinished(finishedValue);
  };
  
  useEffect(() => {
    refreshStartedFinished(votingSystem);
  }, [votingSystem]);


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

  function refreshAllVoting(votingSystem, started, finished) {
    if (!votingSystem) {
      return;
    }
    votingSystem.voted().then(setVoted);
    fetchCandidates(votingSystem).then(setCandidates);
    if (started || finished) {
      console.log("fetching winner", started, finished);
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
    refreshAllVoting(votingSystem, started, finished);
  }, [votingSystem, started, finished]);

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
    const VotingFactory = new ethers.ContractFactory(contractABI.abi, contractABI.bytecode, signer);
    try {
      const contractInstance = await VotingFactory.deploy();
      await contractInstance.deployed();
      setContractAddress(contractInstance.address);
    } catch (error) {
      console.log(error)
      setErrorMessage(txErrorToHumanReadable(error));
    } 
  }

  if (!votingSystem) {
    return (
    <div className="narrower-column">
      <div className="narrower-column-internal">
        <h2>Administrator panel</h2>
        <p>Provider: {provider.connection.url}</p>
        <h3>Select identity: </h3>
        <select value={selectedSigner} onChange={onSignerSelect} 
          title="Select your identity from several available demo signers"> {optionItems} </select>
        <div> <button className="action-button" onClick={onDeployNewContract}
          title="Deploy a fresh contract as a current user who is going to be its admin">
          Deploy new voting system
        </button> </div>
      </div>
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
    refreshStartedFinished(votingSystem);
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
    refreshAllVoting(votingSystem, started, finished)
  };

  const handleVoteInputChange = (event) => {
    setVoteInputValue(event.target.value);
  };

  const adminPanel = (
    <div className="narrower-column">
      <div className="narrower-column-internal">
        <h2>Administrator panel</h2>
        <p>Network {provider.connection.url}</p>
        <p>Contract {contractAddress}</p>
        <h3>Select identity:</h3>
        <select value={selectedSigner} onChange={onSignerSelect} 
          title="Select your identity from several available demo signers. Select admin identity for extra abilities"> 
          {optionItems} 
        </select>
        {isOwner && !finished && (<div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}> 
          <button className="action-button" onClick={onToggleVoting}>
            {started ? "Finish": "Start"} voting!
          </button>
          <h4 style={{ margin: '10px'}}>You are the admin  </h4> 
          </div>)} 
        {!isOwner && (<p>You are a regular user</p>)}
        <div> 
          <button className="action-button" onClick={onDeployNewContract} 
              title="Deploy a fresh contract as a current user. This signer is going to be its admin">
            Deploy new voting system 
          </button> 
        </div>
        {errorMessage && (
          <div className="error-popup">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );


  const candidatesPanel = (
    <div>
    <h3>Candidates:</h3>
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
    </div>
  );

  const winnerPanel = (
    currentWinner && (
      <div class="winner-container">
        <div>
          <h3>Current winner:</h3>
          <div class="winner-text">{currentWinner}</div>
          {finished && <div class="winner-highlight">🎉 Winner! 🎉</div>}
        </div>
      </div>
    )
  );


  const notStartedPanel = (
    <div className="wider-column">
      <h3 className="centered">Voting has hasn't started
      </h3>
      <div className="form-container">
      <form onSubmit={handleAddCandidateSubmit}>
        <label className="form-label">
          Add candidate address:
        </label>
        <input className="form-input" type="text" list="candidateAddresses" value={candidateInputValue} onChange={handleCandidateInputChange} />
        <datalist id="candidateAddresses">
          {optionItems}
        </datalist>
        <button className="action-button" type="submit">Add</button>
      </form>
      </div>
      {candidatesPanel}
    </div>
  );

  const startedPanel = (
    <div className="wider-column">
      <h3 id="voting-header" className={started ? (finished ? "finished" : "") : "not-started"}>
        Voting has <span className={started ? (finished ? "finished" : "") : "not-started"}>{started ? "started": "not started"}</span>, you 
        <span className={`status-indicator ${voted ? "voted" : "not-voted"}`} id="voting-status">{voted ? " have voted": " haven't voted"}</span>
      </h3>
      <div className="form-container">
        <form onSubmit={handleVoteSubmit}>
          <label className="form-label">
            Vote for (candidate address):
          </label>
          <input className="form-input" type="text" list="candidateAddresses" value={voteInputValue} onChange={handleVoteInputChange} />
          <datalist id="candidateAddresses">
            {optionItems}
          </datalist>
          <button className="action-button" type="submit">Vote</button>
        </form>
      </div>
      {winnerPanel}
      {candidatesPanel}
    </div>
  );

  const finishedPanel = (
    <div className="wider-column">
      <h3 id="voting-header" className={started ? (finished ? "finished" : "") : "not-started"}>
        Voting has finished, you 
        <span className={`status-indicator ${voted ? "voted" : "not-voted"}`} id="voting-status">{voted ? " have voted": " haven't voted"}</span>
      </h3>
      {winnerPanel}
      {candidatesPanel}
    </div>
  );

  return (
    <div className="container">
      {started ? startedPanel: (finished ? finishedPanel : notStartedPanel)}
      {adminPanel}
    </div>
  );

};

function YourComponent() {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [candidateInputValue, setCandidateInputValue] = useState("");
  const candidateList = ["Address 1", "Address 2", "Address 3"];

  function handleSelectChange(event) {
    setSelectedCandidate(event.target.value);
    setCandidateInputValue(""); // clear the input field when an address is selected
  }

  function handleCandidateInputChange(event) {
    setCandidateInputValue(event.target.value);
    setSelectedCandidate(""); // clear the selected address when a new address is entered
  }

  function handleAddCandidateSubmit(event) {
    event.preventDefault();
    if (selectedCandidate) {
      // handle adding the selected address
    } else if (candidateInputValue) {
      // handle adding the entered address
    } else {
      // handle error case where no address is selected or entered
    }
  }

  return (
    <form onSubmit={handleAddCandidateSubmit}>
      <label className="form-label">
        Add candidate address:
      </label>
      <div className="form-group">
        <select className="form-select" value={selectedCandidate} onChange={handleSelectChange}>
          <option value="">Select an address</option>
          {candidateList.map((address, index) => (
            <option key={index} value={address}>{address}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">
          Or enter a new address:
        </label>
        <input className="form-input" type="text" value={candidateInputValue} onChange={handleCandidateInputChange} />
      </div>
      <button className="action-button" type="submit">Add</button>
    </form>
  );
}
