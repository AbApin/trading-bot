'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import './page.module.css'; // Adjust the path as necessary

const CryptoTablePage = () => {
  const searchParams = useSearchParams();
  const cryptoParam = searchParams.get('crypto') || 'DOGSUSDT'; // Default to DOGSUSDT if no param
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${cryptoParam}`
        );
        const newPrice = parseFloat(priceResponse.data.price);

        const volumeResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${cryptoParam}`
        );
        const volume24hUSDT = parseFloat(volumeResponse.data.quoteVolume);
