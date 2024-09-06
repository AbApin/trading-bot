'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/globals.css'; // Assuming your CSS file is in the same directory

const FAVORITE_CRYPTOS = [
  'DOGSUSDT',
  'TONUSDT',
  'ADAUSDT',
  'NOTUSDT',
  'PEPEUSDT',
  '1000SATSUSDT',
  'BONKUSDT',
];

export default function Home() {
  const [selectedCrypto, setSelectedCrypto] = useState(FAVORITE_CRYPTOS[0]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [priceColor, setPriceColor] = useState('black');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [cryptoBalance, setCryptoBalance] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [klinesData, setKlinesData] = useState([]);
  const [priceError, setPriceError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const tableRef = useRef(null); // For auto-scroll

  // Fetch Prices and Balances
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${selectedCrypto}`,
        );
        const newPrice = parseFloat(response.data.price);

        if (previousPrice !== null) {
          if (newPrice > previousPrice) {
            setPriceColor('green');
          } else if (newPrice < previousPrice) {
            setPriceColor('red');
          } else {
            setPriceColor('black');
          }
        }

        setPreviousPrice(currentPrice);
        setCurrentPrice(newPrice);
        setPriceError(null);
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
        setBalanceError(null);
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
    }, 1000); // Fetch every second

    return () => clearInterval(id);
  }, [selectedCrypto, currentPrice, previousPrice]);

  // Fetch Klines (24-hour data)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const endTime = Date.now();
        const startTime = endTime - 24 * 60 * 60 * 1000; // 24 hours ago

        const response = await axios.get('https://api.binance.com/api/v3/klines', {
          params: {
            symbol: selectedCrypto,
            interval: '1m', // 1-minute intervals
            startTime,
            endTime,
          },
        });

        setKlinesData(response.data);
        setPriceError(null);
      } catch (error) {
        console.error('Error fetching klines data:', error);
        setPriceError('Failed to fetch klines data.');
      }
    };

    fetchInitialData();
  }, [selectedCrypto]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/klines', {
          params: {
            symbol: selectedCrypto,
            interval: '1m',
            limit: 1, // Get the latest kline
          },
        });

        const newKline = response.data[0];

        setKlinesData((prevData) => {
          const newData = [...prevData, newKline];

          // Remove data older than 24 hours
          const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
          const filteredData = newData.filter((kline) => kline[0] >= twentyFourHoursAgo);

          return filteredData;
        });
      } catch (error) {
        console.error('Error fetching latest kline data:', error);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [selectedCrypto]);

  // Auto-scroll logic
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [klinesData]);

  // Start Trading Logic
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
          setOrderError(null);
        }

        if (price >= max && cryptoBalance && cryptoBalance > 0.0001) {
          const quantity = cryptoBalance.toFixed(6);
          await axios.post('/api/order', {
            symbol: selectedCrypto,
            side: 'SELL',
            quantity,
          });
          setOrderError(null);
        }
      } catch (error) {
        console.error('Order error:', error);
        setOrderError('Failed to execute trade order.');
      }
    }, 10000); // Attempt trade every 10 seconds

    setIntervalId(id);
  };

  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

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

      {/* Display Current Price */}
      <div className="infoContainer">
        <p>
          <strong>Current Price:</strong>{' '}
          <span className="crypto-price" style={{ color: priceColor }}>
            {currentPrice ? `$${currentPrice.toFixed(7)}` : 'Loading...'}
          </span>
        </p>
        {priceError && <p className="error">{priceError}</p>}
      </div>

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

      {/* Start and Stop Buttons */}
      <div className="buttonsContainer">
        <button onClick={handleStart} disabled={intervalId}>
          Start Trading
        </button>
