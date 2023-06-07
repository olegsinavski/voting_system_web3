
import { makeTransaction } from './utils';


export default function StartStopVotingButton({ 
        isOwner, started, finished, votingSystem, 
        refreshStartedFinished, setLoading, setErrorMessage }) {

  const onToggleVoting = async () => {
    await makeTransaction(started ? votingSystem.finishVoting : votingSystem.startVoting, setLoading, setErrorMessage);
    refreshStartedFinished(votingSystem);
  };

  return (
    <div>
      {isOwner && !finished && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <button className="action-button" onClick={onToggleVoting}>
            {started ? 'Finish' : 'Start'} voting!
          </button>
          <h4 style={{ margin: '10px' }}>You are the admin</h4>
        </div>
      )}
      {!isOwner && <p>You are a regular user</p>}
    </div>
  );
}