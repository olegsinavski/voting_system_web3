// import logo from './logo.svg';
import './App.css';

import { validateAddress, txErrorToHumanReadable } from './utils';
import { useState, useEffect } from 'react';
import { useDisappearingError } from './error';
import useAdminPanel from "./adminPanel"


import { fetchCandidates, fetchCurrentWinner, CandidatesPanel, WinnerPanel} from './candidates';
import Spinner from './spinner';


export default function App() {
  const [errorMessage, setErrorMessage] = useDisappearingError();
  const [loading, setLoading] = useState(false);

  const [votingSystem, started, finished, signers, adminPanel] = useAdminPanel(
    errorMessage, setLoading, setErrorMessage);

  const [voted, setVoted] = useState(false);

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
  

  if (!votingSystem) {
    return (
    <div>
      <Spinner loading={loading}/>
      {adminPanel}
    </div>);
  }

  const optionItems = signers.map(s => 
    <option key={s} value={s}>{s}</option>
  );

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

  const notStartedPanel = (
    <div className="wider-column">
      <h3 id="voting-header" className={started ? (finished ? "finished" : "") : "not-started"}>
        Voting has <span className={started ? (finished ? "finished" : "") : "not-started"}>{started ? "started": "not started"}</span>, you 
        <span className={`status-indicator ${voted ? "voted" : "not-voted"}`} id="voting-status">{voted ? " have voted": " haven't voted"}</span>
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
