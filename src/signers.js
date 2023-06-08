import { useState, useEffect } from 'react';

/**
 * Custom hook that fetches signers based on the provided provider.
 * If the provider is not available, it sets the signers array to an empty array.
 * If the provider is available, it fetches signers either from a single Metamask signer
 * or from the local provider.
 *
 * @param {Object} provider - The provider object.
 * @returns {Object} - An object containing the signers array, the current signer address,
 * and a function to set the current signer address.
 */
export function useSigners(provider) {
  const [signers, setSigners] = useState([]);
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");

  useEffect(() => {
    const fetchSigners = async () => {
      if (!provider) {
        setSigners([]);
        return;
      }
      let promises = [];
      if (provider.connection.url === "metamask") {
        // get single metamask signer
        promises = [provider.getSigner().getAddress()];
      } else {
        // Fetch few first signers from the local provider
        promises = [...Array(10).keys()].map(i => provider.getSigner(i).getAddress());
      }
      const results = await Promise.all(promises);
      setSigners(results);
      setCurrentSignerAddress(results[0]);
    };
    fetchSigners();
  }, [provider]);

  return { signers, currentSignerAddress, setCurrentSignerAddress };
}

/**
 * A functional component that renders an identity panel.
 *
 * @param {Object} props - The component props containing the signers array,
 * the current signer address, and a function to set the current signer address.
 * @returns {JSX.Element} - The rendered component.
 */
export function IdentityPanel({ signers, currentSignerAddress, setCurrentSignerAddress }) {
  return (
    <div>
      {signers.length === 1 ? (
        <div>
          <h3>Your identity:</h3>
          <h4>{signers[0]}</h4>
        </div>
      ) : (
        <div>
          <h3>Select identity:</h3>
          <select
            value={currentSignerAddress}
            onChange={(event) => setCurrentSignerAddress(event.target.value)}
            title="Select your identity from several available demo signers"
          >
            {signers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
