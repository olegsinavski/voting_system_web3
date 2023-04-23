import { ethers } from 'ethers';
import { useState, useEffect } from 'react';


export default function useEthersProvider(endpoint) {
    const [provider, setProvider] = useState(null);
  
    useEffect(() => {
      const fetchProvider = async () => {
        console.log("Connecting...");
        const newProvider = new ethers.providers.JsonRpcProvider(endpoint);
        setProvider(newProvider);
      };
      fetchProvider();
      return () => {
        if (provider) {
          console.log("Disconnecting");
          provider.removeAllListeners();
          // provider.connection.close();
        }
      };
    }, [endpoint]);
  
    return provider;
};