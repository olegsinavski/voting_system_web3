import { ethers } from "ethers";
import { makeOperation } from './utils';

/**
 * DeployContractButton component renders a button for deploying a new contract.
 *
 * @param {object} provider - The Ethereum provider.
 * @param {string} currentSignerAddress - The address of the current signer.
 * @param {object} contractABI - The ABI (Application Binary Interface) of the contract.
 * @param {function} setContractAddress - A function to set the deployed contract address.
 * @param {function} setLoading - A function to set the loading state.
 * @param {function} setErrorMessage - A function to set the error message.
 * @returns {JSX.Element} - The DeployContractButton component.
 */
function DeployContractButton({ provider, currentSignerAddress, contractABI, setContractAddress, setLoading, setErrorMessage }) {
  /**
   * Handler for deploying a new contract.
   */
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
