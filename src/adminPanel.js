import React, { useEffect, useState } from 'react';
import contractABI from './artifacts/contracts/VotingSystem.sol/VotingSystem.json';
import { useEthersProvider } from './ethersProvider';
import DeployContractButton from "./deployButton";
import StartStopVotingButton from "./startVotingButton";
import { IdentityPanel } from './signers';
import { ProviderSelection } from './ethersProvider';
import { ErrorPopup } from './error';
import { useIsOwner, useContract } from './contract';
import { useSigners } from './signers';

const useAdminPanel = (
  errorMessage,
  setLoading,
  setErrorMessage,
) => {
    
  const [contractAddress, setContractAddress] = useState("");  
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [provider, networkName] = useEthersProvider('http://127.0.0.1:8545', useMetaMask, setErrorMessage);
  
  const {signers, currentSignerAddress, setCurrentSignerAddress}  = useSigners(provider);
  const votingSystem = useContract(provider, currentSignerAddress, contractAddress, contractABI.abi);
  const isOwner = useIsOwner(votingSystem, currentSignerAddress);

  async function refreshStartedFinished(votingSystem) {
    if (!votingSystem) {
      return;
    }
    const startedValue = await votingSystem.started();
    const finishedValue = await votingSystem.finished();
    setStarted(startedValue);
    setFinished(finishedValue);
  }

  useEffect(() => {
    refreshStartedFinished(votingSystem);
  }, [votingSystem]);

  const adminPanel = (
    <div className="narrower-column">
      <div className="narrower-column-internal">
        <h2>Administrator panel</h2>
        <ProviderSelection
          useMetaMask={useMetaMask}
          setUseMetaMask={setUseMetaMask}
          networkName={networkName}
        />
        {contractAddress && <p>Contract {contractAddress}</p>}
        <IdentityPanel
          signers={signers}
          currentSignerAddress={currentSignerAddress}
          setCurrentSignerAddress={setCurrentSignerAddress}
        />
        {votingSystem && (
          <StartStopVotingButton
            isOwner={isOwner}
            started={started}
            finished={finished}
            votingSystem={votingSystem}
            refreshStartedFinished={refreshStartedFinished}
            setLoading={setLoading}
            setErrorMessage={setErrorMessage}
          />
        )}
        <DeployContractButton
          provider={provider}
          currentSignerAddress={currentSignerAddress}
          contractABI={contractABI}
          setLoading={setLoading}
          setContractAddress={setContractAddress}
          setErrorMessage={setErrorMessage}
        />
        <ErrorPopup errorMessage={errorMessage} />
      </div>
    </div>
  );
  return [votingSystem, started, finished, signers, adminPanel];
};

export default useAdminPanel;
