'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

const CryptoTablePage = () => {
  const searchParams = useSearchParams();
  const cryptoParam = searchParams.get('crypto') || 'DOGSUSDT'; // Default to DOGSUSDT if no param
  const [tableData, setTableData] = useState([]);
  const router = useRouter();

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
        const volumeRatio =
          volume24hCrypto > 0 ? (volume24hUSDT / volume24hCrypto).toFixed(7) : '0';

        // Update data with the new entry
        setTableData((prevData) => [
          {
            dateTime: new Date().toLocaleString(),
            volumeRatio: volumeRatio,
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

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="table-container">
      <button onClick={handleGoHome} className="back-button">
        Back to Home
      </button>
      <table className="crypto-table">
        <thead>
          <tr>
            <th>Date and Time</th>
            <th>Volume Ratio (USDT/Crypto)</th>
            <th>Current Price</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index} className={index === 0 ? 'fixed-row' : ''}>
              <td>{row.dateTime}</td>
              <td>{row.volumeRatio}</td>
              <td>{row.currentPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoTablePage;
