import { useState, useEffect } from 'react';

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
    return await votingSystem.currentWinner();
};
  