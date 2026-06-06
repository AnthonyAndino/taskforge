import { Server as HTTPServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import jwt from 'jsonwebtoken'

const clients = new Map<string, Set<WebSocket>>()

export function createWebSocketServer(server: HTTPServer) {
    const wss = new WebSocketServer({ server, path: '/ws' })

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const token = url.searchParams.get('token')

        if (!token) {
            ws.close(4001, 'Missing token')
            return
        }

        try {
            const payload = jwt.verify(token, 'secret') as { userId: string }
            const userId = payload.userId

            if (!clients.has(userId)) {
                clients.set(userId, new Set())
            }
            clients.get(userId)!.add(ws)

            ws.on('close', () => {
                clients.get(userId)?.delete(ws)
                if (clients.get(userId)?.size === 0) {
                    clients.delete(userId)
                }
            })

            ws.on('error', () => {
                clients.get(userId)?.delete(ws)
            })

            ws.send(JSON.stringify({ type: 'connected', userId }))
        } catch {
            ws.close(4001, 'Invalid token')
        }
    })

    return wss
}

export function broadcastEvent(event: { type: string; payload: unknown }) {
    const message = JSON.stringify(event)
    for (const sockets of clients.values()) {
        for (const ws of sockets) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message)
            }
        }
    }
}

export function sendToUser(userId: string, event: { type: string; payload: unknown }) {
    const sockets = clients.get(userId)
    if (!sockets) return

    const message = JSON.stringify(event)
    for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message)
        }
    }
}
