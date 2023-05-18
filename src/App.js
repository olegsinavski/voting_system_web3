// import logo from './logo.svg';
import './App.css';

import { ethers } from 'ethers';
import { validateAddress, txErrorToHumanReadable } from './utils';
import { useState, useEffect } from 'react';
import { useEthersProvider } from './ethersProvider';
// import Signers from './signers';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

import { fetchCandidates, fetchCurrentWinner} from './candidates';
import Spinner from './spinner';


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
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [provider, networkName] = useEthersProvider('http://127.0.0.1:8545', useMetaMask, setErrorMessage);
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
      let promises = [];
      if (provider.connection.url === "metamask") {
        // get single metamask signer
        promises = [provider.getSigner().getAddress()];
      } else {
        // Fetch few first signers from the local provider
        promises = [...Array(10).keys()].map(i => provider.getSigner(i).getAddress());
      }
      const results = await Promise.all(promises);
      setSigners(results);
      setCurrentSignerAddress(results[0]);
      setSelectedSigner(results[0]);
    };
    fetchSigners();
  }, [provider, useMetaMask]);

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

  useEffect(() => {
    console.log("trigger error effect", errorMessage);
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

  async function onDeployNewContract() {
    const signer = provider.getSigner(currentSignerAddress);
    const VotingFactory = new ethers.ContractFactory(contractABI.abi, contractABI.bytecode, signer);
    try {
      setLoading(true);
      const contractInstance = await VotingFactory.deploy();
      await contractInstance.deployed();
      setContractAddress(contractInstance.address);
    } catch (error) {
      setErrorMessage(txErrorToHumanReadable(error));
    } 
    setLoading(false);
  }

  const deployButton = (
    <div> <button className="action-button" onClick={onDeployNewContract}
    title="Deploy a fresh contract as a current user who is going to be its admin">
    Deploy new voting system
   </button> 
  </div>
  );

  const toggleProvider = () => {
    setUseMetaMask(!useMetaMask);
  };

  const providerSelection = (
    <div>
      <div className="provider-selector">
        <label htmlFor="provider-select">Provider:</label>
        <select id="provider-select" value={useMetaMask ? "metamask" : "local"} onChange={toggleProvider}>
          <option value="local">Local node</option>
          <option value="metamask">MetaMask</option>
        </select>
      </div>
    <p>Network {networkName ? networkName: "(none)"}</p>
    </div>
  );

  const identitySelection = (
    <div>
    {signers.length == 1 ? (
      <div>
      <h3>Your identity:</h3>
      <h4>{signers[0]}</h4>
      </div>
    ): (
      <div>
      <h3>Select identity:</h3>
      <select value={selectedSigner} onChange={onSignerSelect} 
        title="Select your identity from several available demo signers"> {optionItems} 
      </select>
      </div>
    )}
    </div>
  );



  if (!votingSystem) {
    return (
    <div>
    {loading && <Spinner/>}
    
    <div className="narrower-column">
      <div className="narrower-column-internal">
        <h2>Administrator panel</h2>
        {providerSelection}
        {identitySelection}
        {deployButton}
        {errorMessage && (
          <div className="error-popup">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
    </div>);
  }

  function onSignerSelect(event) {
    setCurrentSignerAddress(event.target.value);
    setSelectedSigner(event.target.value);
  }

  async function onToggleVoting() {
    try {
      setLoading(true);
      const tx = started ? await votingSystem.finishVoting() : await votingSystem.startVoting();
      const response = await tx.wait();
      console.log('Transaction response:', response);
    } catch (error) {
      console.log(error)
      setErrorMessage(txErrorToHumanReadable(error));
    } 
    setLoading(false);
    refreshStartedFinished(votingSystem);
  }

  async function handleAddCandidateSubmit(event) {
    event.preventDefault();
    if (!validateAddress(candidateInputValue)) {
      setErrorMessage('Invalid candidate address - should be full address');
      return;
    }
    try {
        setLoading(true);
        const tx = await votingSystem.addCandidate(candidateInputValue);
        const response = await tx.wait();
        console.log('Add candidate response:', response);
    } catch(error) {
        console.log(error)
        setErrorMessage(txErrorToHumanReadable(error));
    }
    setLoading(false);
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
      setLoading(true);
      const tx = await votingSystem.vote(voteInputValue);
      const response = await tx.wait();
      console.log('Voting response:', response);
    } catch(error) {
      console.log(error)
      setErrorMessage(txErrorToHumanReadable(error));
    }
    setLoading(false);
    refreshAllVoting(votingSystem, started, finished)
  };

  const handleVoteInputChange = (event) => {
    setVoteInputValue(event.target.value);
  };

  const adminPanel = (
    <div className="narrower-column">
      <div className="narrower-column-internal">
        <h2>Administrator panel</h2>
        {providerSelection}
        <p>Contract {contractAddress}</p>
        {identitySelection}
        {isOwner && !finished && (<div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}> 
          <button className="action-button" onClick={onToggleVoting}>
            {started ? "Finish": "Start"} voting!
          </button>
          <h4 style={{ margin: '10px'}}>You are the admin  </h4> 
          </div>)} 
        {!isOwner && (<p>You are a regular user</p>)}
        {deployButton}
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
      <div className="winner-container">
        <div>
          <h3>Current winner:</h3>
          <div className="winner-text">{currentWinner}</div>
          {finished && <div className="winner-highlight">🎉 Winner! 🎉</div>}
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
      {loading && <Spinner/>}
      {started ? startedPanel: (finished ? finishedPanel : notStartedPanel)}
      {adminPanel}
    </div>
  );

};
