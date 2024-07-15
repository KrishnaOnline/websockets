import { useEffect, useState } from "react";
import "./App.css";

function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");
        ws.onopen = () => {
            console.log("Connected...");
            setSocket(ws);
        }
        return () => {
            ws.close();
        }
    }, [])

    return socket;
}

function App() {
	// const [socket, setSocket] = useState<null | WebSocket>(null);
    const [latestMsg, setLatestMsg] = useState("");
    const [chatMsgs, setChatMsgs] = useState<string[]>([]);

    // useEffect(() => {
    //     const ws = new WebSocket("ws://localhost:8080");
    //     ws.onopen = () => {
    //         console.log("Connected...");
    //         setSocket(ws);
    //     }
    //     ws.onmessage = (message) => {
    //         console.log("Recieved Message: ", message.data);
    //         setChatMsgs(prev => [...prev, message.data]);
    //     }
    //     return () => {
    //         ws.close();
    //     }
    // }, [])
    
    const socket = useSocket();
    
    useEffect(() => {
        console.log(socket);
        if(socket) {
            socket.onmessage = (message) => {
                console.log("Recieved Message: ", message.data);
                setChatMsgs(prev => [...prev, message.data]);
            }
        }
    }, [socket])

    // if(socket) {
    //     socket.onmessage = (message) => {
    //         console.log("Recieved Message: ", message.data);
    //         setChatMsgs(prev => [...prev, message.data]);
    //     }
    // }

    if(!socket) {
        return <div>Connecting WS...</div>
    }

    return (
        <div>
            <input 
                onChange={e => {
                    setLatestMsg(e.target.value);
                }}
            ></input>
            <button
                onClick={() => {
                    socket.send(latestMsg);
                    setLatestMsg("");
                }}
            >Send</button>
            {
                chatMsgs.map((c, i) => (
                    <div key={i}>{c}</div>
                ))
            }
        </div>
    )
}

export default App;