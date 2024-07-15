import { WebSocket } from "ws";

export const groupChat = (wss:any, data:any, isBinary:any) => {
    wss.clients.forEach(function each(client:any) {      // example, in a multiplayer game, if one moves, all other knows we moved... (OR) sending messages in a broadcast channel...
        // Example,  if(client.room === someRoomX) { /*Do Something...*/ }
        if(client.readyState === WebSocket.OPEN) {
            client.send(data, { binary: isBinary });
        }
    });
}