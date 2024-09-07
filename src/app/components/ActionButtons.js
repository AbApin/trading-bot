'use client';
import React from 'react';

const ActionButtons = ({ handleStart, handleStop, intervalId, router, selectedCrypto }) => {
  return (
    <div className="buttonsContainer">
      <button onClick={handleStart} disabled={intervalId} className="actionButton">
        Start Trading
      </button>
      <button onClick={handleStop} disabled={!intervalId} className="actionButton">
        Stop Trading
      </button>
    </div>
  );
};

export default ActionButtons;
