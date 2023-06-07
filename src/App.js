import './App.css';

import { useState, useEffect } from 'react';
import { useDisappearingError } from './error';
import useAdminPanel from "./adminPanel";
import { CandidateForm } from "./candidateForm"
import { makeTransaction } from './utils';
import Spinner from './spinner';
import VotingHeader from './votingHeader';
import { fetchCandidates, fetchCurrentWinner, CandidatesPanel, WinnerPanel} from './candidates';


export default function App() {
  const [errorMessage, setErrorMessage] = useDisappearingError();
  const [loading, setLoading] = useState(false);

  const [votingSystem, started, finished, signers, adminPanel] = useAdminPanel(
    errorMessage, setLoading, setErrorMessage);

  const [voted, setVoted] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [currentWinner, setCurrentWinner] = useState("");

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


  async function onAddCandidate(address) {
      await makeTransaction(() => votingSystem.addCandidate(address), setLoading, setErrorMessage);
      fetchCandidates(votingSystem).then(setCandidates)
  };

  async function onVote(address) {
      await makeTransaction(() => votingSystem.vote(address), setLoading, setErrorMessage);
      refreshAllVoting(votingSystem)
  };


  if (votingSystem) {
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
                {started ? <WinnerPanel currentWinner={currentWinner} finished={false} /> : ""}
              </div>
            }
            <CandidatesPanel candidates={candidates} />
        </div>
        {adminPanel}
      </div>
    );
  } else {
    return (
    <div>
      <Spinner loading={loading}/>
      {adminPanel}
    </div>);
  }

};
