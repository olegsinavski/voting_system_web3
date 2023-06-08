/**
 * Fetches the list of candidates and their vote counts from the voting system.
 * @param {object} votingSystem - The voting system object.
 * @returns {Promise<Array>} - A promise that resolves to an array of candidate objects with their addresses and vote counts.
 */
export async function fetchCandidates(votingSystem) {
  if (!votingSystem) {
    return [];
  }
  const numberOfCandidates = await votingSystem.getCandidateSize();
  let candidateVotes = [];
  for (let index = 0; index < numberOfCandidates; index++) {
    const candidate = await votingSystem.getCandidate(index);
    const votes = await votingSystem.getCandidateVotes(candidate);
    candidateVotes.push({ address: candidate, votes: votes.toString() });
  }
  return candidateVotes;
}

/**
 * Fetches the current winner from the voting system.
 * @param {object} votingSystem - The voting system object.
 * @returns {Promise<*>} - A promise that resolves to the current winner, or an empty array if no winner exists.
 */
export async function fetchCurrentWinner(votingSystem) {
  if (!votingSystem) {
    return [];
  }
  try {
    return await votingSystem.currentWinner();
  } catch (error) {
    return [];
  }
}

/**
 * Renders a panel displaying the list of candidates and their vote counts.
 * @param {Array} candidates - An array of candidate objects with addresses and vote counts.
 * @returns {JSX.Element} - JSX element representing the candidates panel.
 */
export const CandidatesPanel = ({ candidates }) => {
  return (
    <div>
      <h3>Candidates:</h3>
      <table className="candidate-table">
        <thead>
          <tr>
            <th>Candidate Address</th>
            <th>Number of Votes</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.address}>
              <td>{candidate.address}</td>
              <td>{candidate.votes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Renders a panel displaying the current winner and a winner highlight if the voting process is finished.
 * @param {*} currentWinner - The current winner of the voting process.
 * @param {boolean} finished - Indicates whether the voting process is finished.
 * @returns {JSX.Element} - JSX element representing the winner panel.
 */
export const WinnerPanel = ({ currentWinner, finished }) => {
  return (
    <div className="winner-container">
      {currentWinner ? (
        <div>
          <h3>Current winner:</h3>
          <div className="winner-text">{currentWinner}</div>
          {finished && <div className="winner-highlight">🎉 Winner! 🎉</div>}
        </div>
      ) : (
        <div className="no-votes-message">No votes have been casted</div>
      )}
    </div>
  );
};
