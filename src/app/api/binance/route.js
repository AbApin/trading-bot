import client from '../../lib/binance.js';

export async function POST(request) {
  const { symbol, side, quantity } = await request.json();

  if (!symbol || !side || !quantity) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
  }

  try {
    const order = await client.order({
      symbol,
      side,
      quantity,
      type: 'MARKET',
    });
    return new Response(JSON.stringify(order), { status: 200 });
  } catch (error) {
    console.error('Error placing order:', error.message);
    return new Response(JSON.stringify({ error: 'Error placing order' }), { status: 500 });
  }
}
