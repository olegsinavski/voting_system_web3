import logo from './logo.svg';
import './App.css';

import { ethers } from 'ethers';
import { Contract } from 'ethers';
import contractABI from '../artifacts/contracts/VotingSystem.sol/VotingSystem.json';


function App() {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // replace with your contract address
  const votingSystem = new Contract(contractAddress, contractABI.abi, provider);

  const [started, setStarted] = useState(false);
  useEffect(() => {
    const fetchStarted = async () => {
      const startedValue = await votingSystem.started();
      setStarted(startedValue);
    };
    fetchStarted();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <h1>{started ? 'Contract has started' : 'Contract has not started'}</h1>
        </div>
      </header>
    </div>
  );
}

export default App;
