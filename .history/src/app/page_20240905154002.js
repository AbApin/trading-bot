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
  const [volume24hUSDT, setVolume24hUSDT] = useState(null);
  const [volume24hCrypto, setVolume24hCrypto] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null); // To track price changes
  const [priceColor, setPriceColor] = useState('black'); // Default color
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [cryptoBalance, setCryptoBalance] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());

  // Error Handling States
  const [orderError, setOrderError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [priceError, setPriceError] = useState(null);

  // Fetch Prices, Volumes, and Balances
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedCrypto}`,
        );

        const newPrice = parseFloat(priceResponse.data.lastPrice); // Current price
        const volumeCrypto = parseFloat(priceResponse.data.volume); // 24-hour volume in crypto
        const volumeUSDT = parseFloat(priceResponse.data.quoteVolume); // 24-hour volume in USDT

        // Update price color based on price change
        if (previousPrice !== null) {
          if (newPrice > previousPrice) {
            setPriceColor('green');
          } else if (newPrice < previousPrice) {
            setPriceColor('red');
          } else {
            setPriceColor('black');
          }
        }

        setPreviousPrice(currentPrice); // Update previous price
        setCurrentPrice(newPrice); // Set current price
        setVolume24hCrypto(volumeCrypto); // Set 24-hour volume in crypto
        setVolume24hUSDT(volumeUSDT); // Set 24-hour volume in USDT
        setPriceError(null); // Clear previous errors if successful
        setDateTime(new Date()); // Update date and time to current
      } catch (error) {
        console.error('Error fetching crypto data:', error);
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

    fetchCryptoData();
    fetchBalances();

    const id = setInterval(() => {
      fetchCryptoData(); // Fetch every 10 seconds
      fetchBalances();
    }, 10000);

    return () => clearInterval(id);
  }, [selectedCrypto, currentPrice, previousPrice]);

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
      <div className="selectContainer">
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

      {/* Table to Display Date, Volume, and Price */}
      <table className="crypto-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Volume (USDT / Crypto)</th>
            <th>Current Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Column 1: Current Date & Time */}
            <td>{dateTime.toLocaleString()}</td>

            {/* Column 2: Volume in USDT / Crypto */}
            <td>
              {volume24hUSDT ? volume24hUSDT.toFixed(2) : 'Loading...'} USDT /{' '}
              {volume24hCrypto ? volume24hCrypto.toFixed(6) : 'Loading...'}{' '}
              {selectedCrypto.replace('USDT', '')}
            </td>

            {/* Column 3: Current Price */}
            <td>
              <span style={{ color: priceColor }}>
                {currentPrice ? `$${currentPrice.toFixed(6)}` : 'Loading...'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Display Balances */}
      <div className="infoContainer">
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
      <div className="inputsContainer">
        <div className="inputGroup">
          <label htmlFor="min-price">Min Price:</label>
          <input
            id="min-price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Enter minimum price"
          />
        </div>
        <div className="inputGroup">
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
      <div className="buttonsContainer">
        <button onClick={handleStart} disabled={intervalId}>
          Start Trading
        </button>
        <button onClick={handleStop} disabled={!intervalId}>
          Stop Trading
        </button>
      </div>

      <OrderHistory selectedCrypto={selectedCrypto} />
    </div>
  );
}
