
import { txErrorToHumanReadable } from './utils';


export default function StartStopVotingButton({ 
        isOwner, started, finished, votingSystem, 
        refreshStartedFinished, setLoading, setErrorMessage }) {

  const onToggleVoting = async () => {
    try {
      setLoading(true);
      const tx = started ? await votingSystem.finishVoting() : await votingSystem.startVoting();
      const response = await tx.wait();
      console.log('Transaction response:', response);
    } catch (error) {
      console.log(error);
      setErrorMessage(txErrorToHumanReadable(error));
    }
    setLoading(false);
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