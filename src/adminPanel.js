
import React from 'react';
import DeployContractButton from "./deployButton";
import StartStopVotingButton from "./startVotingButton";
import { IdentityPanel } from './signers';
import { ProviderSelection } from './ethersProvider';
import { ErrorPopup } from './error';

const AdminPanel = ({
  useMetaMask,
  setUseMetaMask,
  networkName,
  contractAddress,
  signers,
  currentSignerAddress,
  setCurrentSignerAddress,
  isOwner,
  started,
  finished,
  votingSystem,
  refreshStartedFinished,
  setLoading,
  setErrorMessage,
  provider,
  contractABI,
  setContractAddress,
  errorMessage,
}) => {


  return (
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
};

export default AdminPanel;
