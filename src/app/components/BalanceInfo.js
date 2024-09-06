'use client';
import React from 'react';

const BalanceInfo = ({ usdtBalance, cryptoBalance, selectedCrypto, balanceError }) => {
  return (
    <div className="infoContainer">
      <p>
        <strong>USDT Balance:</strong>{' '}
        {usdtBalance !== null ? `$${usdtBalance.toFixed(2)}` : 'Loading...'}
      </p>
      <p>
        <strong>{selectedCrypto.replace('USDT', '')} Balance:</strong>{' '}
        {cryptoBalance !== null ? cryptoBalance.toFixed(6) : 'Loading...'}
      </p>
      {balanceError && <p className="error">{balanceError}</p>}
    </div>
  );
};

export default BalanceInfo;
