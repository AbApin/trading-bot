'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './styles/globals.css'; // Adjust the path as necessary
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
]; // Add your favorite cryptos here

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

  const [orderError, setOrderError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [priceError, setPriceError] = useState(null);

  const router = useRouter();

  // Similar useEffect for fetching price and balances
  useEffect(() => {
    // Fetching logic as in the previous code
  }, [selectedCrypto, currentPrice, previousPrice]);

  const handleStart = () => {
    // Start trading logic
  };

  const handleStop = () => {
    // Stop trading logic
  };

  return (
    <div className="container">
      <div className="homeInner">
        <div className="w-50">
          <h1>Crypto Trading Bot</h1>
          <CryptoSelect
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            FAVORITE_CRYPTOS={FAVORITE_CRYPTOS}
          />
          <CryptoPrice
            currentPrice={currentPrice}
            priceColor={priceColor}
            priceError={priceError}
          />
          <BalanceInfo
            usdtBalance={usdtBalance}
            cryptoBalance={cryptoBalance}
            selectedCrypto={selectedCrypto}
            balanceError={balanceError}
          />
          <PriceInput
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
          {orderError && <p className="error">{orderError}</p>}
          <ActionButtons
            handleStart={handleStart}
            handleStop={handleStop}
            intervalId={intervalId}
            router={router}
            selectedCrypto={selectedCrypto}
          />
        </div>
        <div className="w-50">
          <CryptoTable selectedCrypto={selectedCrypto} />
        </div>
      </div>
    </div>
  );
}
