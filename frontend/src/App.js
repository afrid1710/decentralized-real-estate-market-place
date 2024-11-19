import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateMarketplace from './RealEstateMarketplace.json'; // Import the ABI of the contract
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [properties, setProperties] = useState([]);
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('mint');

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, RealEstateMarketplace.abi, signer);
        setContract(marketplaceContract);
      } else {
        alert('MetaMask not detected');
      }
    };
    connectWallet();
  }, []);

  const mintProperty = async (title, location, price) => {
    if (!contract) return;

    try {
      const tx = await contract.mintProperty(title, location, ethers.utils.parseEther(price));
      await tx.wait();
      alert('Property Minted!');
      fetchOwnedProperties(); // Refresh owned properties
    } catch (error) {
      console.error("Error minting property:", error);
      alert('Failed to mint property. See console for details.');
    }
  };

  const listPropertyForSale = async (propertyId, price) => {
    if (!contract) return;

    try {
      const tx = await contract.listPropertyForSale(propertyId, ethers.utils.parseEther(price));
      await tx.wait();
      alert('Property listed for sale!');
      fetchOwnedProperties(); // Refresh owned properties
    } catch (error) {
      console.error("Error listing property for sale:", error);
      alert('Failed to list property. See console for details.');
    }
  };

  const buyProperty = async (propertyId, price) => {
    if (!contract) return;

    try {
      const tx = await contract.buyProperty(propertyId, { value: ethers.utils.parseEther(price) });
      await tx.wait();
      alert('Property Bought!');
      fetchOwnedProperties(); // Refresh owned properties
      fetchProperties(); // Refresh all properties
    } catch (error) {
      console.error("Error buying property:", error);
      alert('Failed to buy property. See console for details.');
    }
  };

  const fetchProperties = async () => {
    if (!contract) return;
    const propertyCount = await contract.getTotalProperties();
    const propertyList = [];

    for (let i = 1; i <= propertyCount.toNumber(); i++) {
      const property = await contract.getPropertyDetails(i);
      propertyList.push(property);
    }
    setProperties(propertyList);
  };

  const fetchOwnedProperties = async () => {
    if (!contract || !account) return;
    const propertyCount = await contract.getTotalProperties();
    const ownedList = [];

    for (let i = 1; i <= propertyCount.toNumber(); i++) {
      const property = await contract.getPropertyDetails(i);
      if (property.owner.toLowerCase() === account.toLowerCase()) {
        ownedList.push(property);
      }
    }
    setOwnedProperties(ownedList);
  };

  return (
    <div className="container">
      <h1>Decentralized Real Estate Marketplace</h1>
      <p><strong>My Connected Account Address: </strong>{account}</p>

      {/* Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'mint' ? 'active' : ''}`}
            onClick={() => setActiveTab('mint')}
          >
            Mint Property
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('buy');
              fetchProperties(); // Fetch properties when switching to the Buy tab
            }}
          >
            Buy Property
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('owned');
              fetchOwnedProperties(); // Fetch owned properties when switching to the Owned tab
            }}
          >
            My Properties
          </a>
        </li>
      </ul>

      {/* Mint Property Tab Content */}
      {activeTab === 'mint' && (
        <div className="mt-3">
          <h2>Mint New Property</h2>
          <input type="text" placeholder="Title" id="title" className="form-control mb-2" />
          <input type="text" placeholder="Location" id="location" className="form-control mb-2" />
          <input type="text" placeholder="Price in ETH" id="price" className="form-control mb-2" />
          <button
            className="btn btn-primary"
            onClick={() => mintProperty(
              document.getElementById('title').value,
              document.getElementById('location').value,
              document.getElementById('price').value
            )}
          >
            Mint Property
          </button>
        </div>
      )}

      {/* Buy Property Tab Content */}
      {activeTab === 'buy' && (
        <div className="mt-3">
          <h2>Available Properties</h2>
          <button className="btn btn-secondary mb-3" onClick={fetchProperties}>Refresh Properties</button>
          <ul className="list-group">
            {properties.map((property, index) => (
              <li key={index} className="list-group-item">
                <p>Title: {property.title}</p>
                <p>Location: {property.location}</p>
                <p>Price: {ethers.utils.formatEther(property.price)} ETH</p>
                {property.forSale && (
                  <button className="btn btn-success" onClick={() => buyProperty(property.id, ethers.utils.formatEther(property.price))}>
                    Buy Property
                  </button>
                )}
                {!property.forSale && (
                  <p className='text-danger'>Property Sold</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* My Properties Tab Content */}
      {activeTab === 'owned' && (
        <div className="mt-3">
          <h2>My Properties</h2>
          <ul className="list-group">
            {ownedProperties.map((property, index) => (
              <li key={index} className="list-group-item">
                <p>Title: {property.title}</p>
                <p>Location: {property.location}</p>
                <p>Price: {ethers.utils.formatEther(property.price)} ETH</p>
                <button className="btn btn-warning" onClick={() => listPropertyForSale(property.id, ethers.utils.formatEther(property.price))}>
                  List for Sale
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
