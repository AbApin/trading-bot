'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/globals.css';
import './styles/home.css'; // Adjust the path as necessary
import CryptoSelect from './components/CryptoSelect';
import CryptoPrice from './components/CryptoPrice';
import BalanceInfo from './components/BalanceInfo';
import PriceInput from './components/PriceInput';
import ActionButtons from './components/ActionButtons';
import CryptoTable from './components/CryptoTable';

const FAVORITE_CRYPTOS = [
  'DOGSUSDT',
  'TONUSDT',
  'ADAUSDT',
  'NOTUSDT',
  'PEPEUSDT',
  '1000SATSUSDT',
  'BONKUSDT',
  'BTCUSDT',
]; // Add your favorite cryptos here

export default function Home() {
  const [selectedCrypto, setSelectedCrypto] = useState(FAVORITE_CRYPTOS[0]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [cryptoBalance, setCryptoBalance] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const [orderError, setOrderError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [priceError, setPriceError] = useState(null);

  const [showVolumeTable, setShowVolumeTable] = useState(false);

  // Fetch Prices and Balances
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${selectedCrypto}`,
        );
        const newPrice = parseFloat(response.data.price);

        setPreviousPrice(currentPrice); // Update previous price
        setCurrentPrice(newPrice); // Set current price
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
  }, [selectedCrypto, currentPrice, previousPrice]);

  // Inside your component
  const currentPriceRef = useRef(currentPrice);
  const minPriceRef = useRef(minPrice);
  const maxPriceRef = useRef(maxPrice);
  const usdtBalanceRef = useRef(usdtBalance);
  const cryptoBalanceRef = useRef(cryptoBalance);

  useEffect(() => {
    currentPriceRef.current = currentPrice;
    minPriceRef.current = minPrice;
    maxPriceRef.current = maxPrice;
    usdtBalanceRef.current = usdtBalance;
    cryptoBalanceRef.current = cryptoBalance;
  }, [currentPrice, minPrice, maxPrice, usdtBalance, cryptoBalance]);

  const handleStart = () => {
    if (intervalId) return;

    const id = setInterval(async () => {
      console.log(currentPriceRef.current); // Use the ref to get the latest value
      try {
        const price = parseFloat(currentPriceRef.current);
        const min = parseFloat(minPriceRef.current);
        const max = parseFloat(maxPriceRef.current);

        // Buy order logic
        if (price <= min && usdtBalanceRef.current && usdtBalanceRef.current > 1) {
          const quantity = (usdtBalanceRef.current / price).toFixed(6);
          await axios.post('/api/order', {
            symbol: selectedCrypto,
            side: 'BUY',
            quantity,
          });
          setOrderError(null); // Clear previous errors if successful
        }

        // Sell order logic
        if (price >= max && cryptoBalanceRef.current && cryptoBalanceRef.current > 0.0001) {
          const quantity = cryptoBalanceRef.current.toFixed(6);
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
    }, 1000); // Attempt trade every 1 second

    setIntervalId(id);
  };

  // Stop Trading
  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  return (
    <div className="container">
      <div className="homeInner">
        <div className="w-50">
          <h1 className="title">Crypto Trading Bot</h1>
          <CryptoSelect
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            FAVORITE_CRYPTOS={FAVORITE_CRYPTOS}
          />
          <CryptoPrice currentPrice={currentPriceRef.current} priceError={priceError} />
          <BalanceInfo
            usdtBalance={usdtBalanceRef.current}
            cryptoBalance={cryptoBalanceRef.current}
            selectedCrypto={selectedCrypto}
            balanceError={balanceError}
          />
          <PriceInput
            minPrice={minPrice.current}
            maxPrice={maxPrice.current}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
          {orderError && <p className="error">{orderError}</p>}
          <ActionButtons
            handleStart={handleStart}
            handleStop={handleStop}
            intervalId={intervalId}
            selectedCrypto={selectedCrypto}
          />
        </div>
        <div className="w-50 cryptoTableContainer">
          <button onClick={() => setShowVolumeTable(!showVolumeTable)} className="showVolumeTable">
            {showVolumeTable ? 'Hide' : 'Show'} Volume Table
          </button>
          {showVolumeTable && <CryptoTable selectedCrypto={selectedCrypto} />}
        </div>
      </div>
    </div>
  );
}
