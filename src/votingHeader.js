/**
 * The VotingHeader component displays the status of a voting process.
 * @param {boolean} started - Indicates whether the voting process has started.
 * @param {boolean} finished - Indicates whether the voting process has finished.
 * @param {boolean} voted - Indicates whether the user has voted.
 * @returns {JSX.Element} - The rendered VotingHeader component.
 */
export default function VotingHeader({ started, finished, voted }) {
    return (
      <h3
        id="voting-header"
        className={finished ? "finished" : started ? "started" : "not-started"}
      >
        Voting has{" "}
        <span
          id="voting-status"
          className={finished ? "finished" : started ? "" : "not-started"}
        >
          {finished ? "finished" : started ? "started" : "not started"}
        </span>
        , you
        <span
          className={`status-indicator ${voted ? "voted" : "not-voted"}`}
          id="voting-status"
        >
          {voted ? " have voted" : " haven't voted"}
        </span>
      </h3>
    );
  }
  