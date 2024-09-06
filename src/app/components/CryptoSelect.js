'use client';
import React from 'react';

const CryptoSelect = ({ selectedCrypto, setSelectedCrypto, FAVORITE_CRYPTOS }) => {
  return (
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
  );
};

export default CryptoSelect;
