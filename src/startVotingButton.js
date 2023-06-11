import { makeTransaction } from './utils';

/**
 * Component for rendering the start/stop voting button.
 * 
 * @param {boolean} isOwner - Indicates if the user is the owner/admin.
 * @param {boolean} started - Indicates if the voting has started.
 * @param {boolean} finished - Indicates if the voting has finished.
 * @param {object} votingSystem - The object representing the voting system.
 * @param {function} refreshStartedFinished - Function to refresh the started/finished status.
 * @param {function} setLoading - Function to set the loading state.
 * @param {function} setErrorMessage - Function to set the error message.
 * @returns {JSX.Element} - The rendered JSX element.
 */
export default function StartStopVotingButton({ 
    isOwner, started, finished, votingSystem, 
    refreshStartedFinished, setLoading, setErrorMessage }) {

  /**
   * Handles the toggle of the voting status.
   * Calls the appropriate voting system function and updates the started/finished status.
   */
  const onToggleVoting = async () => {
    await makeTransaction(started ? votingSystem.finishVoting : votingSystem.startVoting, setLoading, setErrorMessage);
    refreshStartedFinished(votingSystem);
  };

  return (
    <div>
      {/* Render button and admin message if the user is the owner and the voting is not finished */}
      {isOwner && !finished && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <button className="action-button" onClick={onToggleVoting}>
            {started ? 'Finish' : 'Start'} voting!
          </button>
          <h4 style={{ margin: '10px' }}>You are the admin</h4>
        </div>
      )}
      {/* Render regular user message if the user is not the owner */}
      {!isOwner && <p>You are a regular user</p>}
    </div>
  );
}
