import express from 'express';
import { createServer } from 'http';
import WebSocket, { Server } from 'ws';

const app = express();
const server = createServer(app);
const wss = new Server({ server });

interface StockPrices {
  [key: string]: number;
}

interface LeaderboardEntry {
  user: string;
  score: number;
}

interface ChatMessage {
  user: string;
  message: string;
}

let stocks: StockPrices = {
  AAPL: 150,
  GOOGL: 2750,
  AMZN: 3400,
};

let leaderboard: LeaderboardEntry[] = [
  { user: 'Alice', score: 1200 },
  { user: 'Bob', score: 1100 },
  { user: 'Charlie', score: 900 },
];

let chatMessages: ChatMessage[] = [];

function updateStocks(): void {
  stocks = {
    AAPL: +(stocks.AAPL + (Math.random() - 0.5) * 10).toFixed(2),
    GOOGL: +(stocks.GOOGL + (Math.random() - 0.5) * 50).toFixed(2),
    AMZN: +(stocks.AMZN + (Math.random() - 0.5) * 100).toFixed(2),
  };
  broadcastMessage({ type: 'stock-update', stocks });
}

function updateLeaderboard(): void {
  leaderboard = leaderboard.map(entry => ({
    ...entry,
    score: entry.score + Math.floor(Math.random() * 100),
  })).sort((a, b) => b.score - a.score);
  broadcastMessage({ type: 'leaderboard-update', leaderboard });
}

function broadcastMessage(message: any): void {
  const messageString = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

setInterval(updateStocks, 1000);
setInterval(updateLeaderboard, 1000);

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'stock-update', stocks }));
  ws.send(JSON.stringify({ type: 'leaderboard-update', leaderboard }));
  ws.send(JSON.stringify({ type: 'chat-update', chatMessages }));

  ws.on('message', (message: string) => {
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case 'chat-message':
        chatMessages.push(parsedMessage);
        broadcastMessage({ type: 'chat-update', chatMessages });
        break;
      case 'score-update':
        leaderboard = leaderboard.map(user =>
          user.user === parsedMessage.user ? { ...user, score: parsedMessage.score } : user
        ).sort((a, b) => b.score - a.score);
        broadcastMessage({ type: 'leaderboard-update', leaderboard });
        break;
      case 'text-update':
        broadcastMessage(parsedMessage);
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server started on port 3001');
});