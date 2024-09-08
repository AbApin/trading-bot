'use client';
import React from 'react';

const CryptoPrice = ({ currentPrice, priceError }) => {
  return (
    <div className="infoContainer">
      <p className="priceSub">
        <strong>Current Price:</strong>{' '}
        <span className="crypto-price">
          {currentPrice
            ? `$${currentPrice > 1 ? currentPrice : currentPrice.toFixed(7)}`
            : 'Loading...'}
        </span>
      </p>
      {priceError && <p className="error">{priceError}</p>}
    </div>
  );
};

export default CryptoPrice;
