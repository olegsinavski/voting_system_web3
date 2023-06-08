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

/**
 * Custom hook for the admin panel functionality.
 * @param {string} errorMessage - Error message to display.
 * @param {function} setLoading - Setter function to update loading state.
 * @param {function} setErrorMessage - Setter function to update error message.
 * @returns {Array} - Array containing votingSystem, started, finished, signers, and adminPanel.
 */
export default function useAdminPanel(
  errorMessage,
  setLoading,
  setErrorMessage,
) {
  // State variables
  const [contractAddress, setContractAddress] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(false);

  // Get provider and network name using custom hook
  const [provider, networkName] = useEthersProvider('http://127.0.0.1:8545', useMetaMask, setErrorMessage);

  // Get signers and current signer address using custom hook
  const { signers, currentSignerAddress, setCurrentSignerAddress } = useSigners(provider);

  // Get voting system contract using custom hook
  const votingSystem = useContract(provider, currentSignerAddress, contractAddress, contractABI.abi);

  // Check if current signer is the owner of the contract
  const isOwner = useIsOwner(votingSystem, currentSignerAddress);

  /**
   * Refreshes the started and finished values of the voting system.
   * @param {object} votingSystem - Instance of the voting system contract.
   */
  async function refreshStartedFinished(votingSystem) {
    if (!votingSystem) {
      return;
    }
    const startedValue = await votingSystem.started();
    const finishedValue = await votingSystem.finished();
    setStarted(startedValue);
    setFinished(finishedValue);
  }

  // Refresh started and finished values when votingSystem changes
  useEffect(() => {
    refreshStartedFinished(votingSystem);
  }, [votingSystem]);

  // JSX for the admin panel
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
