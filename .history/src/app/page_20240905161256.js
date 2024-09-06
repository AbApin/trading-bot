'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/globals.css'; // Adjust the path as necessary
import OrderHistory from './components/OrderHistory';

const FAVORITE_CRYPTOS = [
  'DOGSUSDT',
  'TONUSDT',
  'ADAUSDT',
  'NOTUSDT',
  'PEPEUSDT',
  '1000SATSUSDT',
  'BONKUSDT',
]; // Add your favorite cryptos here

export default function Home() {
  // State Variables
  const [selectedCrypto, setSelectedCrypto] = useState(FAVORITE_CRYPTOS[0]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceColor, setPriceColor] = useState('black'); // Default color
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [cryptoBalance, setCryptoBalance] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [dataTable, setDataTable] = useState([]);

  // Error Handling States
  const [orderError, setOrderError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [priceError, setPriceError] = useState(null);

  // Fetch Prices and Balances
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedCrypto}`,
        );
        const newPrice = parseFloat(response.data.lastPrice);
        const volumeUsdt = parseFloat(response.data.quoteVolume);
        const volumeCrypto = parseFloat(response.data.volume);

        // Update price color based on price change
        setPriceColor((prevPrice) => {
          if (prevPrice !== null) {
            return newPrice > prevPrice ? 'green' : newPrice < prevPrice ? 'red' : 'black';
          }
          return 'black';
        });

        setCurrentPrice(newPrice); // Set current price

        // Compute ratio
        const ratio = (volumeUsdt / volumeCrypto).toFixed(2);

        // Add data to table
        setDataTable((prevData) => [
          ...prevData.slice(-23), // Keep last 24 rows
          {
            date: new Date().toLocaleString(),
            ratio,
            price: newPrice,
          },
        ]);

        setPriceError(null); // Clear previous errors if successful
      } catch (error) {
        console.error('Price fetch error:', error);
        setPriceError('Failed to fetch current price.');
      }
    };

    const fetchBalances = async () => {
      try {
        const balanceResponse = await axios.get(`/api/balance?selectedCrypto=${selectedCrypto}`);
        setUsdtBalance(parseFloat(balanceResponse.data.usdtBalance));
        setCryptoBalance(parseFloat(balanceResponse.data.cryptoBalance));
        setBalanceError(null); // Clear previous errors if successful
      } catch (error) {
        console.error('Balance fetch error:', error);
        setBalanceError('Failed to fetch account balances.');
      }
    };

    fetchPrice();
    fetchBalances();

    const id = setInterval(() => {
      fetchPrice();
      fetchBalances();
    }, 1000); // Fetch every 1 second

    return () => clearInterval(id);
  }, [selectedCrypto]);

  // Start Trading
  const handleStart = () => {
    if (intervalId) return;

    const id = setInterval(async () => {
      try {
        if (!currentPrice || !minPrice || !maxPrice) return;

        const price = parseFloat(currentPrice);
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (price <= min && usdtBalance && usdtBalance > 1) {
          const quantity = (usdtBalance / price).toFixed(6);
          await axios.post('/api/order', {
            symbol: selectedCrypto,
            side: 'BUY',
            quantity,
          });
          setOrderError(null); // Clear previous errors if successful
        }

        if (price >= max && cryptoBalance && cryptoBalance > 0.0001) {
          const quantity = cryptoBalance.toFixed(6);
          await axios.post('/api/order', {
            symbol: selectedCrypto,
            side: 'SELL',
            quantity,
          });

          setOrderError(null); // Clear previous errors if successful
        }
      } catch (error) {
        console.error('Order error:', error);
        setOrderError('Failed to execute trade order.');
      }
    }, 10000); // Attempt trade every 10 seconds

    setIntervalId(id);
  };

  // Stop Trading
  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Render UI
  return (
    <div className="container">
      <h1>Crypto Trading Bot</h1>

      {/* Cryptocurrency Selection */}
      <div className="select-container">
        <label htmlFor="crypto-select">Select Cryptocurrency:</label>
        <select
          id="crypto-select"
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}>
          {FAVORITE_CRYPTOS.map((crypto) => (
            <option key={crypto} value={crypto}>
              {crypto}
            </option>
          ))}
        </select>
      </div>

      {/* Display Current Price */}
      <div className="info-container">
        <p>
          <strong>Current Price:</strong>{' '}
          <span className="crypto-price" style={{ color: priceColor }}>
            {currentPrice ? `$${currentPrice.toFixed(7)}` : 'Loading...'}
          </span>
        </p>
        {priceError && <p className="error">{priceError}</p>}
      </div>

      {/* Display Balances */}
      <div className="info-container">
        <p>
          <strong>USDT Balance:</strong>{' '}
          {usdtBalance !== null ? `$${usdtBalance.toFixed(2)}` : 'Loading...'}
        </p>
        <p>
          <strong>{selectedCrypto.replace('USDT', '')} Balance:</strong>{' '}
          {cryptoBalance !== null ? cryptoBalance.toFixed(6) : 'Loading...'}
        </p>
        {balanceError && <p className="error">{balanceError}</p>}
      </div>

      {/* Input Fields for Min and Max Prices */}
      <div className="inputs-container">
        <div className="input-group">
          <label htmlFor="min-price">Min Price:</label>
          <input
            id="min-price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Enter minimum price"
          />
        </div>
        <div className="input-group">
          <label htmlFor="max-price">Max Price:</label>
          <input
            id="max-price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Enter maximum price"
          />
        </div>
      </div>

      {/* Order Error Message */}
      {orderError && <p className="error">{orderError}</p>}

      {/* Start and Stop Buttons */}
      <div className="buttons-container">
        <button onClick={handleStart} disabled={intervalId}>
          Start Trading
        </button>
        <button onClick={handleStop} disabled={!intervalId}>
          Stop Trading
        </button>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>Date and Time</th>
              <th>Volume Ratio (USDT/Crypto)</th>
              <th>Current Price (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {dataTable.map((row, index) => (
              <tr key={index}>
                <td>{row.date}</td>
                <td>{row.ratio} USDT</td>
                <td>{row.price.toFixed(7)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderHistory selectedCrypto={selectedCrypto} />
    </div>
  );
}
