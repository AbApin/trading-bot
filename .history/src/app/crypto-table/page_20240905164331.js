'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import './page.module.css'; // Adjust the path as necessary

const CryptoTablePage = () => {
  const searchParams = useSearchParams();
  const cryptoParam = searchParams.get('crypto') || 'DOGSUSDT'; // Default to DOGSUSDT if no param
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${cryptoParam}`,
        );
        const newPrice = parseFloat(priceResponse.data.price);

        const volumeResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${cryptoParam}`,
        );
        const volume24hUSDT = parseFloat(volumeResponse.data.quoteVolume);
        const volume24hCrypto = parseFloat(volumeResponse.data.volume);
        const volumeRatio = volume24hUSDT / volume24hCrypto;

        // Update data with the new entry
        setData((prevData) => [
          {
            dateTime: new Date().toLocaleString(),
            volumeRatio: volumeRatio.toFixed(2),
            currentPrice: newPrice.toFixed(7),
          },
          ...prevData.slice(0, 143), // Keep only the last 24 hours of data (assuming 1 entry per minute)
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 1000); // Fetch every 1 second

    return () => clearInterval(id);
  }, [cryptoParam]);

  return (
    <div className="container">
      <h1>{cryptoParam} 24h Data</h1>
      <div className="tableContainer">
        <table className="cryptoTable">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Volume Ratio (USDT/crypto)</th>
              <th>Current Price (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.dateTime}</td>
                <td>{row.volumeRatio}</td>
                <td>{row.currentPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTablePage;
