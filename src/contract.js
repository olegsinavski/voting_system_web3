import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

/**
 * Custom hook to initialize a contract instance.
 * @param {ethers.providers.Provider} provider - Ethereum provider instance.
 * @param {string} signerAddress - Address of the signer.
 * @param {string} contractAddress - Address of the contract.
 * @param {Array} abi - Contract ABI (Application Binary Interface).
 * @returns {ethers.Contract|null} - Initialized contract instance or null if any of the parameters is missing.
 */
export function useContract(provider, signerAddress, contractAddress, abi) {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!provider || !signerAddress || !contractAddress) {
      setContract(null);
      return;
    }

    const signer = provider.getSigner(signerAddress);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    setContract(contract);
  }, [provider, signerAddress, contractAddress]);

  return contract;
};

/**
 * Custom hook to determine if the current signer is the owner of the voting system.
 * @param {ethers.Contract|null} votingSystem - Voting system contract instance.
 * @param {string} currentSignerAddress - Address of the current signer.
 * @returns {boolean} - Whether the current signer is the owner or not.
 */
export function useIsOwner(votingSystem, currentSignerAddress) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const refreshOwner = async () => {
      if (!votingSystem) {
        return;
      }
      const ownerAddress = await votingSystem.owner();
      setIsOwner(ownerAddress === currentSignerAddress);
    }

    refreshOwner();
  }, [votingSystem, currentSignerAddress]);

  return isOwner;
}
