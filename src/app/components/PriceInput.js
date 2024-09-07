'use client';
import React from 'react';

const PriceInput = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
  return (
    <div className="inputsContainer">
      <div className="inputGroup">
        <label htmlFor="min-price" className="label">
          Min Price:
        </label>
        <input
          id="min-price"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="priceInput"
          placeholder="Enter minimum price"
        />
      </div>
      <div className="inputGroup">
        <label htmlFor="max-price" className="label">
          Max Price:
        </label>
        <input
          id="max-price"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="priceInput"
          placeholder="Enter maximum price"
        />
      </div>
    </div>
  );
};

export default PriceInput;
