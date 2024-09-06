'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/globals.css';

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
  // State Variables
  const [selectedCrypto, setSelectedCrypto] = useState(FAVORITE_CRYPTOS[0]);
  const [klinesData, setKlinesData] = useState([]);
  const [priceError, setPriceError] = useState(null);

  // Fetch Initial Klines Data
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

  // Update Klines Data Every Second
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
      <div className="table-container">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Avg Price (Vol USDT / Vol Crypto)</th>
              <th>Close Price</th>
            </tr>
          </thead>
          <tbody>
            {klinesData.map((kline, index) => (
              <tr key={index}>
                {/* Column 1: Date & Time */}
                <td>{new Date(kline[0]).toLocaleString()}</td>

                {/* Column 2: Avg Price (Volume USDT / Volume Crypto) */}
                <td>{(parseFloat(kline[7]) / parseFloat(kline[5]) || 0).toFixed(6)}</td>

                {/* Column 3: Close Price */}
                <td>{parseFloat(kline[4]).toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {priceError && <p className="error">{priceError}</p>}
    </div>
  );
}
