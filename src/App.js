import './App.css';

import { useState, useEffect } from 'react';
import { useDisappearingError } from './error';
import useAdminPanel from "./adminPanel";
import { CandidateForm } from "./candidateForm"
import { makeTransaction } from './utils';
import Spinner from './spinner';
import VotingHeader from './votingHeader';
import { fetchCandidates, fetchCurrentWinner, CandidatesPanel, WinnerPanel} from './candidates';

/**
 * Main component representing the voting application.
 */
export default function App() {
  const [errorMessage, setErrorMessage] = useDisappearingError(); // Custom hook for managing error messages
  const [loading, setLoading] = useState(false); // State for managing loading spinner

  const [votingSystem, started, finished, signers, adminPanel] = useAdminPanel(
    errorMessage, setLoading, setErrorMessage); // Custom hook for managing the voting system and admin panel

  const [voted, setVoted] = useState(false); // State for tracking if the user has voted
  const [candidates, setCandidates] = useState([]); // State for storing the list of candidates
  const [currentWinner, setCurrentWinner] = useState(""); // State for storing the current winner

  /**
   * Refreshes the voting status, candidate list, and current winner.
   * @param {object} votingSystem - The voting system object.
   */
  function refreshAllVoting(votingSystem) {
    if (!votingSystem) {
      return;
    }
    votingSystem.voted().then(setVoted);
    fetchCandidates(votingSystem).then(setCandidates);
    fetchCurrentWinner(votingSystem).then(setCurrentWinner);
  }

  useEffect(() => {
    refreshAllVoting(votingSystem);
  }, [votingSystem]);

  /**
   * Adds a candidate to the voting system.
   * @param {string} address - The address of the candidate.
   */
  async function onAddCandidate(address) {
    await makeTransaction(() => votingSystem.addCandidate(address), setLoading, setErrorMessage);
    fetchCandidates(votingSystem).then(setCandidates);
  };

  /**
   * Votes for a candidate in the voting system.
   * @param {string} address - The address of the candidate to vote for.
   */
  async function onVote(address) {
    await makeTransaction(() => votingSystem.vote(address), setLoading, setErrorMessage);
    refreshAllVoting(votingSystem);
  };

  if (votingSystem) {
    // Render the voting application UI
    return (
      <div className="container">
        <Spinner loading={loading}/>
        <div className="wider-column">
          <VotingHeader started={started} finished={finished} voted={voted} />
          {finished ? 
            <WinnerPanel currentWinner={currentWinner} finished={true} /> :
            <div>
              <CandidateForm 
                label={started ? "Vote for (candidate address):" : "Add candidate address:"}
                buttonLabel={started ? "Vote": "Add" }
                signers={signers}
                setErrorMessage={setErrorMessage}
                onAsyncUpdate={started ? onVote : onAddCandidate}
              />
              {(started && currentWinner.length) ? <WinnerPanel currentWinner={currentWinner} finished={false} /> : ""}
            </div>
          }
          <CandidatesPanel candidates={candidates} />
        </div>
        {adminPanel}
      </div>
    );
  } else {
    // Render the loading spinner and admin panel
    return (
      <div>
        <Spinner loading={loading}/>
        {adminPanel}
      </div>
    );
  }
};
