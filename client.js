const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

const socket = io(SERVER_URL, {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected to the WebSocket server');

  const code = '005930';

  subscribeStock(code);
  subscribeTrade(code);
});

function subscribeStock(stockCode) {
  console.log('Subscribing to stock with code:', stockCode);
  socket.emit('subscribe-stock', { code: stockCode }, (data) => console.log(data));
}

function subscribeTrade(tradeCode) {
  console.log('Subscribing to trade with code:', tradeCode);
  socket.emit('subscribe-trade', { code: tradeCode }, (data) => console.log(data));
}

socket.on('stock', (data) => {
  console.log('📩 Received stock data:', data);
});

socket.on('trade', (data) => {
  console.log('📩 Received trade data:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from the WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('❗ Connection Error:', err.message);
});
