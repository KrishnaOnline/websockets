import React, { useEffect, useState, ChangeEvent } from 'react';

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

interface Message {
  type: string;
  [key: string]: any;
}

const ws = new WebSocket('ws://localhost:3001');

function App() {
  const [stocks, setStocks] = useState<StockPrices>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>('');

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = (message: MessageEvent) => {
      const dataFromServer: Message = JSON.parse(message.data);
      switch (dataFromServer.type) {
        case 'stock-update':
          setStocks(dataFromServer.stocks);
          break;
        case 'leaderboard-update':
          setLeaderboard(dataFromServer.leaderboard);
          break;
        case 'chat-update':
          setChatMessages(dataFromServer.chatMessages);
          break;
        case 'text-update':
          setText(dataFromServer.text);
          break;
        default:
          break;
      }
    };
  }, []);

  const sendMessage = (type: string, content: any) => {
    ws.send(JSON.stringify({ type, ...content }));
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    sendMessage('text-update', { text: newText });
  };

  return (
    <div className="App">
      <h1>Stock Prices</h1>
      <ul>
        {Object.keys(stocks).map(stock => (
          <li key={stock}>{stock}: ${stocks[stock]}</li>
        ))}
      </ul>
      
      <h1>Leaderboard</h1>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={user.user}>{index + 1}. {user.user}: {user.score}</li>
        ))}
      </ul>

      <h1>Chat</h1>
      <ul>
        {chatMessages.map((msg, index) => (
          <li key={index}>{msg.user}: {msg.message}</li>
        ))}
      </ul>
      <input 
        type="text" 
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage('chat-message', { user: 'You', message: e.currentTarget.value });
            e.currentTarget.value = '';
          }
        }}
      />
      
      <h1>Collaborative Text Editor</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        rows={10}
        cols={50}
      />
    </div>
  );
}

export default App;