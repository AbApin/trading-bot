'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/globals.css'; // Adjust the path if necessary

const FAVORITE_CRYPTO = 'DOGSUSDT'; // Replace with your favorite crypto

export default function CryptoTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [volumeRatio, setVolumeRatio] = useState<number | null>(null);

  // Function to fetch price and volume data
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${FAVORITE_CRYPTO}`);
      const price = parseFloat(data.lastPrice);
      const volumeRatioValue = parseFloat(data.quoteVolume) / parseFloat(data.volume);

      setCurrentPrice(price);
      setVolumeRatio(volumeRatioValue);

      const now = new Date().toLocaleString();

      setTableData(prevData => [
        { time: now, volumeRatio: volumeRatioValue, price },
        ...prevData.slice(0, 23) // Keep the last 24 hours of data
      ]);
    } catch (error) {
      console.error('Data fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 1000); // Fetch every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="page-container">
      <div className="table-container">
        <table className="crypto-table">
          <thead>
            <tr className="fixed-row">
              <th>Date and Time</th>
              <th>Volume Ratio (USDT/crypto)</th>
              <th>Current Price</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className={index === 0 ? 'current-row' : ''}>
                <td>{row.time}</td>
                <td>{row.volumeRatio ? `$${row.volumeRatio.toFixed(2)}` : 'Loading...'}</td>
                <td>{row.price ? `$${row.price.toFixed(7)}` : 'Loading...'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
