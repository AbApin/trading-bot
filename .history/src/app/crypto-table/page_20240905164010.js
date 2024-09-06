'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import './page.module.css'; // Adjust the path as necessary

const CryptoTablePage = () => {
  const searchParams = useSearchParams();
  const cryptoParam = searchParams.get('crypto') || 'DOGEUSDT'; // Default to DOGEUSDT if no param
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [volumeUSDT, setVolumeUSDT] = useState(null);
  const [volumeCrypto, setVolumeCrypto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current price
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${cryptoParam}`,
        );
        const newPrice = parseFloat(priceResponse.data.price);

        // Fetch volume data
        const volumeResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${cryptoParam}`,
        );
        const volume24hUSDT = parseFloat(volumeResponse.data.quoteVolume);
        const volume24hCrypto = parseFloat(volumeResponse.data.volume);

        setVolumeUSDT(volume24hUSDT);
        setVolumeCrypto(volume24hCrypto);

        // Calculate ratio
        const ratio = volume24hUSDT / volume24hCrypto;
        const row = {
          timestamp: new Date().toLocaleString(),
          ratio: `${ratio.toFixed(2)} USDT`,
          price: newPrice.toFixed(7),
        };

        setData((prevData) => [row, ...prevData.slice(0, 23)]); // Keep the latest 24 rows
        setCurrentPrice(newPrice);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 1000); // Fetch every second

    return () => clearInterval(intervalId); // Cleanup
  }, [cryptoParam]);

  return (
    <div className="container">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date and Time</th>
              <th>Volume Ratio (USDT)</th>
              <th>Current Price</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index === 0 ? 'latest-row' : ''}>
                <td>{row.timestamp}</td>
                <td>{row.ratio}</td>
                <td>${row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTablePage;
