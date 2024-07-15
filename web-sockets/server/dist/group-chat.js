"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupChat = void 0;
const ws_1 = require("ws");
const groupChat = (wss, data, isBinary) => {
    wss.clients.forEach(function each(client) {
        // Example,  if(client.room === someRoomX) { /*Do Something...*/ }
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data, { binary: isBinary });
        }
    });
};
exports.groupChat = groupChat;
