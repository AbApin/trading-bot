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
  const [selectedCrypto, setSelectedCrypto] = useState(FAVORITE_CRYPTOS[0]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceVolumeRatio, setPriceVolumeRatio] = useState(null);
  const [data, setData] = useState([]);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [priceColor, setPriceColor] = useState('black');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [cryptoBalance, setCryptoBalance] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [priceError, setPriceError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const priceResponse = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedCrypto}`);
        const price = parseFloat(priceResponse.data.price);
        setCurrentPrice(price);

        const volumeResponse = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedCrypto}`);
        const volumeUSDT = parseFloat(volumeResponse.data.volume);
        const volumeCrypto = parseFloat(volumeResponse.data.quoteVolume);
        const ratio = volumeUSDT / volumeCrypto;
        setPriceVolumeRatio(ratio);

        const now = new Date();
        const newData = {
          time: now.toISOString(),
          ratio: ratio.toFixed(4),
          price: price.toFixed(7)
        };

        setData(prevData => [newData, ...prevData].slice(0, 86400)); // Keep data for 24 hours (86400 seconds)

        setPriceColor(previousPrice !== null ? (price > previousPrice ? 'green' : 'red') : 'black');
        setPreviousPrice(price);

        setPriceError(null);
      } catch (error) {
        console.error('Data fetch error:', error);
        setPriceError('Failed to fetch data.');
      }
    };

    fetchData();
    const id = setInterval(fetchData, 1000); // Fetch every second

    return () => clearInterval(id);
  }, [selectedCrypto, previousPrice]);

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
      <div className="infoContainer">
        <p>
          <strong>Current Price:</strong>{' '}
          <span className="crypto-price" style={{ color: priceColor }}>
            {currentPrice ? `$${currentPrice.toFixed(7)}` : 'Loading...'}
          </span>
        </p>
        {priceError && <p
