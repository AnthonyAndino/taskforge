import { describe, it, expect } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app.js'

describe('GET /health', ()=> {
    it('responde con status 200 y { status: "ok" }', async () => {
        const response = await supertest(app).get('/health')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('status', 'ok')
        expect(response.body).toHaveProperty('timestamp')
    })
})

describe('GET /api/ping', ()=> {
    it('responde con 200 y { data: { pong: true } }', async () => {
        const response = await supertest(app).get('/api/ping')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            success: true,
            data: { pong: true },
            timestamp: expect.any(String),
        })
    })
})