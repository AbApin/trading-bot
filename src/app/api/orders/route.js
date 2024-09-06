// src/app/api/orders/route.js
import client from '../../lib/binance.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Symbol is required' }), { status: 400 });
  }

  try {
    const orders = await client.allOrders({
      symbol,
      limit: 10, // Fetch the last 10 orders
    });

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    return new Response(JSON.stringify({ error: 'Error fetching orders' }), { status: 500 });
  }
}
