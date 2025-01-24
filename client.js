const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

const socket = io(SERVER_URL, {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected to the WebSocket server');
  socket.emit('eventName', { message: 'Hello, Server!' });
});

socket.on('events', (data) => {
  console.log('📩 Received event data:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from the WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('❗ Connection Error:', err.message);
});
