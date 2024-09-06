import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderHistory({ selectedCrypto }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/orders?symbol=${selectedCrypto}`);
        setOrders(response.data);
      } catch (error) {
        setError('Error fetching orders');
        console.error('Fetch orders error:', error);
      }
    };

    if (selectedCrypto) {
      fetchOrders();
    }
  }, [selectedCrypto]);

  return (
    <div className="order-history">
      <h2>Order History for {selectedCrypto}</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.orderId}>
            {order.side} {order.origQty} {order.symbol} at {order.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
