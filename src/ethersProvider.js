import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

export function useEthersProvider(endpoint, useMetaMask, setErrorMessage) {
  const [provider, setProvider] = useState(null);
  const [networkName, setNetworkName] = useState("");
  
  useEffect(() => {
    const fetchProvider = async () => {
      console.log("Connecting...");
      if (useMetaMask) {
        if (!window.ethereum) {
          setProvider(null);
          setErrorMessage("No Metamask extension installed");
        } else {
          // Use MetaMask provider
          try {
            await window.ethereum.enable();
            const newProvider = new ethers.providers.Web3Provider(
              window.ethereum
            );
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
          console.log('timeout')
          await Promise.race([newProvider.ready, timeoutPromise]);
          setProvider(newProvider);
        } catch (error) {
          console.log('setting error')
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
        console.log("Disconnecting");
        provider.removeAllListeners();
        // provider.connection.close();
      }
    };
  }, [endpoint, useMetaMask]);

  useEffect(() => {
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
    }
    refreshNetworkName();
  }, [provider, useMetaMask]);
    

  return [provider, networkName];
};

