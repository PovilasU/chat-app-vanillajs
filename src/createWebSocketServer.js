// createWebSocketServer.js
import { WebSocketServer } from "ws";

function createWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (webSocket) => {
    webSocket.on("message", (message) => {
      webSocket.send(message);
    });
  });
}

export default createWebSocketServer;
