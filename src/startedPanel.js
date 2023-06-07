import { validateAddress, makeTransaction } from './utils';
import { useState, useEffect } from 'react';

import { fetchCandidates, fetchCurrentWinner, CandidatesPanel, WinnerPanel} from './candidates';

export function useNotStartedPanel(
    votingSystem,
    started,
    finished,
    voted,
    signers,
    candidates,
    setCandidates,
    setLoading,
    setErrorMessage
  ) {
    const [candidateInputValue, setCandidateInputValue] = useState('');

    async function handleAddCandidateSubmit(event) {
        event.preventDefault();
        if (!validateAddress(candidateInputValue)) {
            setErrorMessage('Invalid candidate address - should be full address');
            return;
        }
        await makeTransaction(() => votingSystem.addCandidate(candidateInputValue), setLoading, setErrorMessage);
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
                {signers.map(s => 
                    <option key={s} value={s}>{s}</option>
                )}
                </datalist>
                <button className="action-button" type="submit">Add</button>
            </form>
            </div>
            <CandidatesPanel candidates={candidates} />
        </div>
    );

    return notStartedPanel;
  }


  export function useStartedPanel(
    votingSystem,
    started,
    finished,
    voted,
    setVoted,
    signers,
    candidates,
    setCandidates,
    currentWinner,
    setCurrentWinner,
    setLoading,
    setErrorMessage
  ) {

    const [voteInputValue, setVoteInputValue] = useState('');

    function refreshAllVoting(votingSystem, started, finished) {
        if (!votingSystem) {
            return;
        }
        votingSystem.voted().then(setVoted);
        fetchCandidates(votingSystem).then(setCandidates);
        if (started || finished) {
            fetchCurrentWinner(votingSystem).then(setCurrentWinner);
        } else {
            setCurrentWinner("");
        }
    }

    useEffect(() => {
        refreshAllVoting(votingSystem, started, finished);
    }, [votingSystem, started, finished]);

    async function handleVoteSubmit(event) {
        event.preventDefault();
        if (!validateAddress(voteInputValue)) {
            setErrorMessage('Invalid vote address - should be full address');
            return;
        }
        await makeTransaction(() => votingSystem.vote(voteInputValue), setLoading, setErrorMessage);
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
                {signers.map(s => 
                  <option key={s} value={s}>{s}</option>
                )}
              </datalist>
              <button className="action-button" type="submit">Vote</button>
            </form>
          </div>
          <WinnerPanel currentWinner={currentWinner} finished={finished} />
          <CandidatesPanel candidates={candidates} />
        </div>
      );

    return startedPanel;

}


export function useFinishedPanel(
    started,
    finished,
    voted,
    candidates,
    currentWinner
  ) {

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

    return finishedPanel;

}