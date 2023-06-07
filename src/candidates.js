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
};


export async function fetchCurrentWinner(votingSystem) {
    if (!votingSystem) {
        return [];
    }
    try {
      return await votingSystem.currentWinner();
    } catch (error) {
      return [];
    }
    
};
  

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
