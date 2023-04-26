import { useState, useEffect } from 'react';

export async function fetchCandidates(votingSystem) {
    if (!votingSystem) {
        console.log("No voting system yet..");
        return [];
    }
    const numberOfCandidates = await votingSystem.getCandidateSize();
    let candidateVotes = [];
    for (let index = 0; index < numberOfCandidates; index++) {
        const candidate = await votingSystem.getCandidate(index);
        const votes = await votingSystem.getCandidateVotes(candidate);
        candidateVotes.push({ address: candidate, votes: votes.toString() });
    }
    console.log("Candiate votes: ", candidateVotes);
    return candidateVotes;
};


export async function fetchCurrentWinner(votingSystem) {
    if (!votingSystem) {
        console.log("No voting system yet..");
        return [];
    }
    return await votingSystem.currentWinner();
};


export function Candidates({ candidates, winner }) {
    const candidateList = candidates.map(candidate => (
        <div key={candidate.address}>
            {candidate.address}: {candidate.votes}
        </div>
    ));
    return (<div>
        <h3>Current candidates:</h3>
        {candidateList}
        <h2> Current winner is {winner}</h2>
    </div>);
}


export function AddCandidateBox({ votingSystem, onAdd, setErrorMessage }) {
    const [inputValue, setInputValue] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(inputValue);
        try {
            const tx = await votingSystem.addCandidate(inputValue);
            const response = await tx.wait();
            console.log('Add candidate response:', response);
        } catch(error) {
            console.log(error)
            setErrorMessage(error.error.error.data.message);
        }
        onAdd();
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Add candidate address:
                <input type="text" value={inputValue} onChange={handleInputChange} />
            </label>
            <button type="submit">Add</button>
        </form>
    );
}