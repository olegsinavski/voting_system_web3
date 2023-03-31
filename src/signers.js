import { useState, useEffect } from 'react';

export default function Signers({provider, setCurrentSigner}) {

    const [signers, setSigners] = useState([]);
    useEffect(() => {
      const fetchSigners = async () => {
        // Fetch 5 first signers from the provider
        const promises = [...Array(5).keys()].map(i => provider.getSigner(i).getAddress());
        const results = await Promise.all(promises);
        setSigners(results);
        console.log('fetching');
        setCurrentSigner(results[0]);
      };
      fetchSigners();
    }, [provider]);
  
    const optionItems = signers.map(s => 
      <option key={s} value={s}>{s}</option>
    );
  
    function onSignerSelect(event) {
      setCurrentSigner(event.target.value);
    }
  
    return (
      <div>
        <select onChange={onSignerSelect}> {optionItems} </select>
      </div>
    )
}