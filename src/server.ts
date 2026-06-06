import { createServer } from 'http'
import { app } from './app.js'
import { createWebSocketServer } from './websocket.js'

const PORT = process.env.PORT ?? 3000

const server = createServer(app)
createWebSocketServer(server)

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`WebSocket running on ws://localhost:${PORT}/ws`)
})
