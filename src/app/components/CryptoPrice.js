'use client';
import React from 'react';

const CryptoPrice = ({ currentPrice, priceColor, priceError }) => {
  return (
    <div className="infoContainer">
      <p>
        <strong>Current Price:</strong>{' '}
        <span className="crypto-price" style={{ color: priceColor }}>
          {currentPrice ? `$${currentPrice.toFixed(7)}` : 'Loading...'}
        </span>
      </p>
      {priceError && <p className="error">{priceError}</p>}
    </div>
  );
};

export default CryptoPrice;
