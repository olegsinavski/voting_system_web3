import { validateAddress, makeTransaction } from './utils';
import { useState } from 'react';

import { fetchCandidates, CandidatesPanel, WinnerPanel} from './candidates';

export function NotStartedPanel({
    votingSystem,
    signers,
    candidates,
    setCandidates,
    setLoading,
    setErrorMessage
}) {
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
        <div>
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


  export function StartedPanel({
    votingSystem,
    signers,
    candidates,
    currentWinner,
    refreshAllVoting,
    setLoading,
    setErrorMessage
  }) {

    const [voteInputValue, setVoteInputValue] = useState('');

    async function handleVoteSubmit(event) {
        event.preventDefault();
        if (!validateAddress(voteInputValue)) {
            setErrorMessage('Invalid vote address - should be full address');
            return;
        }
        await makeTransaction(() => votingSystem.vote(voteInputValue), setLoading, setErrorMessage);
        refreshAllVoting(votingSystem)
    };
    
    const handleVoteInputChange = (event) => {
        setVoteInputValue(event.target.value);
    };

    const startedPanel = (
        <div>
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
          <WinnerPanel currentWinner={currentWinner} finished={false} />
          <CandidatesPanel candidates={candidates} />
        </div>
      );

    return startedPanel;
}


export function FinishedPanel({
    candidates,
    currentWinner
}) {

    const finishedPanel = (
        <div>
          <WinnerPanel currentWinner={currentWinner} finished={true} />
          <CandidatesPanel candidates={candidates} />
        </div>
    );

    return finishedPanel;
}