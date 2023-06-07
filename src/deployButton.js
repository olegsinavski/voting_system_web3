import { ethers } from "ethers";
import { makeOperation } from './utils';

function DeployContractButton({ provider, currentSignerAddress, contractABI, setContractAddress, setLoading, setErrorMessage }) {
  const onDeployNewContract = async () => {
    const signer = provider.getSigner(currentSignerAddress);
    const VotingFactory = new ethers.ContractFactory(contractABI.abi, contractABI.bytecode, signer);
    await makeOperation(async () => {
        const contractInstance = await VotingFactory.deploy();
        await contractInstance.deployed();
        setContractAddress(contractInstance.address);
    }, setLoading, setErrorMessage)
  };

  return (
    <div>
      <button className="action-button" onClick={onDeployNewContract} title="Deploy a fresh contract as a current user who is going to be its admin">
        Deploy new voting system
      </button>
    </div>
  );
}

export default DeployContractButton;
