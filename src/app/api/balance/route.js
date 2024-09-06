import client from '../../lib/binance.js';

export async function GET(request) {
  try {
    // Extract query parameters if any (e.g., selectedCrypto)
    const url = new URL(request.url);
    const selectedCrypto = url.searchParams.get('selectedCrypto') || 'BTCUSDT'; // Default to BTCUSDT if not provided

    // Fetch account information
    const accountInfo = await client.accountInfo();
    const balances = accountInfo.balances;

    // Get USDT balance
    const usdtBalance = balances.find((b) => b.asset === 'USDT')?.free || 0;

    // Get selected crypto balance
    const selectedCryptoSymbol = selectedCrypto.replace('USDT', '');
    const cryptoBalance = balances.find((b) => b.asset === selectedCryptoSymbol) || { free: 0 };

    return new Response(
      JSON.stringify({
        usdtBalance: parseFloat(usdtBalance),
        cryptoBalance: parseFloat(cryptoBalance.free),
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching balance:', error.message);
    return new Response(JSON.stringify({ error: 'Error fetching balance' }), { status: 500 });
  }
}
