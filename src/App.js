import './App.css';

import { useState, useEffect } from 'react';
import { useDisappearingError } from './error';
import useAdminPanel from "./adminPanel";
import { NotStartedPanel, StartedPanel, FinishedPanel } from "./contentPanels"
import Spinner from './spinner';
import VotingHeader from './votingHeader';
import { fetchCandidates, fetchCurrentWinner} from './candidates';


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
  
  if (votingSystem) {
    return (
      <div className="container">
        <Spinner loading={loading}/>
        <div className="wider-column">
            <VotingHeader started={started} finished={finished} voted={voted} />
            {started ? 
              <StartedPanel
                votingSystem={votingSystem}
                signers={signers}
                candidates={candidates}
                currentWinner={currentWinner}
                refreshAllVoting={refreshAllVoting}
                setLoading={setLoading}
                setErrorMessage={setErrorMessage}
              /> : (finished ? 
              <FinishedPanel candidates={candidates} currentWinner={currentWinner}/> : 
              <NotStartedPanel
                votingSystem={votingSystem}
                signers={signers}
                candidates={candidates}
                setCandidates={setCandidates}
                setLoading={setLoading}
                setErrorMessage={setErrorMessage}
              />
            )}
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
