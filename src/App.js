import './App.css';

import { useState, useEffect } from 'react';
import { useDisappearingError } from './error';
import useAdminPanel from "./adminPanel";
import { useNotStartedPanel, useStartedPanel, useFinishedPanel } from "./startedPanel"
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

  const notStartedPanel = useNotStartedPanel(
    votingSystem,
    signers,
    candidates,
    setCandidates,
    setLoading,
    setErrorMessage,
  );

  const startedPanel = useStartedPanel(
    votingSystem,
    signers,
    candidates,
    currentWinner,
    refreshAllVoting,
    setLoading,
    setErrorMessage
  );
  
  const finishedPanel = useFinishedPanel(candidates, currentWinner);

  if (!votingSystem) {
    return (
    <div>
      <Spinner loading={loading}/>
      {adminPanel}
    </div>);
  }

  return (
    <div className="container">
      <Spinner loading={loading}/>
      <div className="wider-column">
          <VotingHeader started={started} finished={finished} voted={voted} />
          {started ? startedPanel: (finished ? finishedPanel : notStartedPanel)}
      </div>
      {adminPanel}
    </div>
  );

};
