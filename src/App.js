// import logo from './logo.svg';
import './App.css';

import { useState } from 'react';
import { useDisappearingError } from './error';
import useAdminPanel from "./adminPanel";
import { useNotStartedPanel, useStartedPanel, useFinishedPanel } from "./startedPanel"
import Spinner from './spinner';


export default function App() {
  const [errorMessage, setErrorMessage] = useDisappearingError();
  const [loading, setLoading] = useState(false);

  const [votingSystem, started, finished, signers, adminPanel] = useAdminPanel(
    errorMessage, setLoading, setErrorMessage);

  const [voted, setVoted] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [currentWinner, setCurrentWinner] = useState("");

  const notStartedPanel = useNotStartedPanel(
    votingSystem,
    started,
    finished,
    voted,
    signers,
    candidates,
    setCandidates,
    setLoading,
    setErrorMessage,
  );

  const startedPanel = useStartedPanel(
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
  );
  
  const finishedPanel = useFinishedPanel(
    started,
    finished,
    voted,
    candidates,
    currentWinner
  );

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
      {started ? startedPanel: (finished ? finishedPanel : notStartedPanel)}
      {adminPanel}
    </div>
  );

};
