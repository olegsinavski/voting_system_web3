

export default function VotingHeader({started, finished, voted}) {
    return (
        <h3 id="voting-header" className={finished ? "finished" : (started ? "started" : "not-started")}>
            Voting has <span id="voting-status" className={finished ? "finished" : (started ? "" : "not-started")}>
                {finished ? "finished" : (started ? "started" : "not started")}
                </span>, you 
            <span className={`status-indicator ${voted ? "voted" : "not-voted"}`} id="voting-status">{voted ? " have voted": " haven't voted"}</span>
        </h3>
    );
}
