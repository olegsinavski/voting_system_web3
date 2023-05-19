import { useState, useEffect } from 'react';



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

  return { signers, currentSignerAddress, setCurrentSignerAddress};
};



// export default function Signers({provider, setCurrentSignerAddress, initialValue}) {

//     const [signers, setSigners] = useState([]);
//     const [selectedSigner, setSelectedSigner] = useState('');
//     useEffect(() => {
//       const fetchSigners = async () => {
//         // Fetch 5 first signers from the provider
//         const promises = [...Array(5).keys()].map(i => provider.getSigner(i).getAddress());
//         const results = await Promise.all(promises);
//         setSigners(results);
//         console.log('fetching');
//         setCurrentSignerAddress(results[0]);
//         setSelectedSigner(results[0]);
//       };
//       fetchSigners();
//     }, [provider]);
  
//     const optionItems = signers.map(s => 
//       <option key={s} value={s}>{s}</option>
//     );
  
//     function onSignerSelect(event) {
//       setCurrentSignerAddress(event.target.value);
//       setSelectedSigner(event.target.value);
//     }
  
//     return (
//       <div>
//         <select value={selectedSigner} onChange={onSignerSelect}> {optionItems} </select>
//       </div>
//     )
// }