import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8081 });

server.on('connection', socket => {
    console.log('A user connected');

    socket.on('message', message => {
        const textMessage = message.toString();
        console.log(`Received: ${textMessage}`);
        
        // Broadcast to all clients
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(textMessage);
            }
        });
    });

    socket.on('close', () => console.log('User disconnected'));
});

console.log('WebSocket server running on ws://localhost:8081');
