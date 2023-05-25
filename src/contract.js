import { ethers } from 'ethers';
import { useState, useEffect } from 'react';


export function useContract(provider, signerAddress, contractAddress, abi) {
    const [contract, setContract] = useState(null);
    useEffect(() => {
        if (!provider) {
        setContract(null);
        return;
        }
        if (!signerAddress) {
        setContract(null);
        return;
        }
        if (!contractAddress) {
        setContract(null);
        return;
        }
        const signer = provider.getSigner(signerAddress);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setContract(contract);
    }, [provider, signerAddress, contractAddress]);
    return contract;
};


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

