'use client';
import React from 'react';

const ActionButtons = ({ handleStart, handleStop, intervalId, router, selectedCrypto }) => {
  return (
    <div className="buttonsContainer">
      <button onClick={handleStart} disabled={intervalId}>
        Start Trading
      </button>
      <button onClick={handleStop} disabled={!intervalId}>
        Stop Trading
      </button>
      <button onClick={() => router.push(`/crypto-table?crypto=${selectedCrypto}`)}>
        View Crypto Table
      </button>
    </div>
  );
};

export default ActionButtons;
