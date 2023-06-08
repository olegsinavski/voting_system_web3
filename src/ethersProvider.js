import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

/**
 * Custom hook for obtaining the Ethereum provider based on the selected option.
 *
 * @param {string} endpoint - The endpoint of the local Ethereum node.
 * @param {boolean} useMetaMask - Flag indicating whether to use MetaMask as the provider.
 * @param {function} setErrorMessage - Function to set the error message.
 * @returns {[Object, string]} - A tuple containing the Ethereum provider and network name.
 */
export function useEthersProvider(endpoint, useMetaMask, setErrorMessage) {
  const [provider, setProvider] = useState(null);
  const [networkName, setNetworkName] = useState("");

  useEffect(() => {
    /**
     * Fetches the Ethereum provider based on the selected option.
     */
    const fetchProvider = async () => {
      if (useMetaMask) {
        if (!window.ethereum) {
          setProvider(null);
          setErrorMessage("No MetaMask extension installed");
        } else {
          // Use MetaMask provider
          try {
            await window.ethereum.enable();
            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            await newProvider.send("eth_requestAccounts", []);
            setProvider(newProvider);
          } catch (error) {
            console.log(error);
            setErrorMessage("Failed to connect to MetaMask:", error);
            setProvider(null);
          }
        }
      } else if (endpoint) {
        // Use local node
        const newProvider = new ethers.providers.JsonRpcProvider(endpoint);

        const timeout = 6000; // Timeout in milliseconds
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeout);
        });

        try {
          await Promise.race([newProvider.ready, timeoutPromise]);
          setProvider(newProvider);
        } catch (error) {
          setErrorMessage("Local node is not available");
          setProvider(null);
        }
      } else {
        setErrorMessage("No Ethereum provider available");
        setProvider(null);
      }
    };

    fetchProvider();

    return () => {
      if (provider) {
        provider.removeAllListeners();
      }
    };
  }, [endpoint, useMetaMask]);

  useEffect(() => {
    /**
     * Refreshes the network name based on the current provider.
     */
    const refreshNetworkName = async () => {
      if (!provider) {
        setNetworkName("");
        return;
      }
      const network = await provider.getNetwork();
      if (!useMetaMask && network.name === "unknown") {
        setNetworkName(provider.connection.url);
      } else {
        setNetworkName(network.name);
      }
    };

    refreshNetworkName();
  }, [provider, useMetaMask]);

  return [provider, networkName];
}

/**
 * Component for selecting the Ethereum provider and displaying the network name.
 *
 * @param {boolean} useMetaMask - Flag indicating whether MetaMask is selected as the provider.
 * @param {function} setUseMetaMask - Function to set the value of useMetaMask.
 * @param {string} networkName - The name of the connected network.
 * @returns {JSX.Element} - The rendered component.
 */
export const ProviderSelection = ({ useMetaMask, setUseMetaMask, networkName }) => {
  return (
    <div>
      <div className="provider-selector">
        <label htmlFor="provider-select">Provider:</label>
        <select
          id="provider-select"
          value={useMetaMask ? 'metamask' : 'local'}
          onChange={() => setUseMetaMask(!useMetaMask)}
        >
          <option value="local">Local node</option>
          <option value="metamask">MetaMask</option>
        </select>
      </div>
      <p>Network {networkName ? networkName : '(none)'}</p>
    </div>
  );
};
