"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = __importStar(require("ws"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.Server({ server });
let stocks = {
    AAPL: 150,
    GOOGL: 2750,
    AMZN: 3400,
};
let leaderboard = [
    { user: 'Alice', score: 1200 },
    { user: 'Bob', score: 1100 },
    { user: 'Charlie', score: 900 },
];
let chatMessages = [];
function updateStocks() {
    stocks = {
        AAPL: +(stocks.AAPL + (Math.random() - 0.5) * 10).toFixed(2),
        GOOGL: +(stocks.GOOGL + (Math.random() - 0.5) * 50).toFixed(2),
        AMZN: +(stocks.AMZN + (Math.random() - 0.5) * 100).toFixed(2),
    };
    broadcastMessage({ type: 'stock-update', stocks });
}
function updateLeaderboard() {
    leaderboard = leaderboard.map(entry => (Object.assign(Object.assign({}, entry), { score: entry.score + Math.floor(Math.random() * 100) }))).sort((a, b) => b.score - a.score);
    broadcastMessage({ type: 'leaderboard-update', leaderboard });
}
function broadcastMessage(message) {
    const messageString = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(messageString);
        }
    });
}
setInterval(updateStocks, 1000);
setInterval(updateLeaderboard, 1000);
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'stock-update', stocks }));
    ws.send(JSON.stringify({ type: 'leaderboard-update', leaderboard }));
    ws.send(JSON.stringify({ type: 'chat-update', chatMessages }));
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage.type) {
            case 'chat-message':
                chatMessages.push(parsedMessage);
                broadcastMessage({ type: 'chat-update', chatMessages });
                break;
            case 'score-update':
                leaderboard = leaderboard.map(user => user.user === parsedMessage.user ? Object.assign(Object.assign({}, user), { score: parsedMessage.score }) : user).sort((a, b) => b.score - a.score);
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
