// import logo from './logo.svg';
import './App.css';

import { ethers } from 'ethers';
import { validateAddress, txErrorToHumanReadable } from './utils';
import { useState, useEffect } from 'react';
import { useEthersProvider, ProviderSelection } from './ethersProvider';
import { useContract, useIsOwner } from './contract';
import { useSigners, IdentityPanel } from './signers';
import { useDisappearingError, ErrorPopup } from './error';
import DeployContractButton from "./deployButton";
import StartStopVotingButton from "./startVotingButton";
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';

import { fetchCandidates, fetchCurrentWinner, CandidatesPanel, WinnerPanel} from './candidates';
import Spinner from './spinner';


export default function App() {
  const [errorMessage, setErrorMessage] = useDisappearingError();

  const [loading, setLoading] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [provider, networkName] = useEthersProvider('http://127.0.0.1:8545', useMetaMask, setErrorMessage);
  const [contractAddress, setContractAddress] = useState("");

  const {signers, currentSignerAddress, setCurrentSignerAddress}  = useSigners(provider);

  const votingSystem = useContract(provider, currentSignerAddress, contractAddress, contractABI.abi);

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
  const isOwner = useIsOwner(votingSystem, currentSignerAddress);

  const [candidates, setCandidates] = useState([]);
  const [currentWinner, setCurrentWinner] = useState("");

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
    refreshAllVoting(votingSystem, started, finished);
  }, [votingSystem, started, finished]);

  const [candidateInputValue, setCandidateInputValue] = useState('');
  const [voteInputValue, setVoteInputValue] = useState('');

  const optionItems = signers.map(s => 
    <option key={s} value={s}>{s}</option>
  );


  if (!votingSystem) {
    return (
    <div>
    <Spinner loading={loading}/>
    <div className="narrower-column">
      <div className="narrower-column-internal">
        <h2>Administrator panel</h2>
        <ProviderSelection
          useMetaMask={useMetaMask}
          setUseMetaMask={setUseMetaMask}
          networkName={networkName}
        />
        <IdentityPanel
          signers={signers}
          currentSignerAddress={currentSignerAddress}
          setCurrentSignerAddress={setCurrentSignerAddress}
        />
        <DeployContractButton
          provider={provider}
          currentSignerAddress={currentSignerAddress}
          contractABI={contractABI}
          setContractAddress={setContractAddress}
          setLoading={setLoading}
          setErrorMessage={setErrorMessage}
        />
        <ErrorPopup errorMessage={errorMessage} />
      </div>
    </div>
    </div>);
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
        <ProviderSelection
          useMetaMask={useMetaMask}
          setUseMetaMask={setUseMetaMask}
          networkName={networkName}
        />
        <p>Contract {contractAddress}</p>
        <IdentityPanel
          signers={signers}
          currentSignerAddress={currentSignerAddress}
          setCurrentSignerAddress={setCurrentSignerAddress}
        />
        <StartStopVotingButton
          isOwner={isOwner}
          started={started}
          finished={finished}
          votingSystem={votingSystem}
          refreshStartedFinished={refreshStartedFinished}
          setLoading={setLoading}
          setErrorMessage={setErrorMessage}
        />
        <DeployContractButton
          provider={provider}
          currentSignerAddress={currentSignerAddress}
          contractABI={contractABI}
          setLoading={setLoading}
          setContractAddress={setContractAddress}
          setErrorMessage={setErrorMessage}
        />
        <ErrorPopup errorMessage={errorMessage} />
      </div>
    </div>
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
      <CandidatesPanel candidates={candidates} />
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
      <WinnerPanel currentWinner={currentWinner} finished={finished} />
      <CandidatesPanel candidates={candidates} />
    </div>
  );

  const finishedPanel = (
    <div className="wider-column">
      <h3 id="voting-header" className={started ? (finished ? "finished" : "") : "not-started"}>
        Voting has finished, you 
        <span className={`status-indicator ${voted ? "voted" : "not-voted"}`} id="voting-status">{voted ? " have voted": " haven't voted"}</span>
      </h3>
      <WinnerPanel currentWinner={currentWinner} finished={finished} />
      <CandidatesPanel candidates={candidates} />
    </div>
  );

  return (
    <div className="container">
      <Spinner loading={loading}/>
      {started ? startedPanel: (finished ? finishedPanel : notStartedPanel)}
      {adminPanel}
    </div>
  );

};
