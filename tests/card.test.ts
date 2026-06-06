import { describe, it, expect, beforeAll } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { pool } from '../src/db/pool.js'

let token: string
let listId: string
let cardId: string

beforeAll(async () => {
    await pool.query('TRUNCATE TABLE users, workspaces, boards, lists, cards, card_labels, activity_log CASCADE')

    const registerRes = await supertest(app)
        .post('/auth/register')
        .send({ email: 'card-test@test.com', password: '123456', name: 'Card Tester' })
    token = registerRes.body.accessToken

    const wsRes = await pool.query("INSERT INTO workspaces (name, slug) VALUES ('Test', 'test') RETURNING *")
    const workspaceId = wsRes.rows[0].id

    const boardRes = await pool.query("INSERT INTO boards (workspace_id, name) VALUES ($1, 'Test Board') RETURNING *", [workspaceId])
    const boardId = boardRes.rows[0].id

    const listRes = await pool.query("INSERT INTO lists (board_id, name, position) VALUES ($1, 'To Do', 0) RETURNING *", [boardId])
    listId = listRes.rows[0].id
})

describe('POST /api/lists/:listId/cards', () => {
    it('crea una tarjeta en la lista', async () => {
        const res = await supertest(app)
            .post(`/api/lists/${listId}/cards`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Card', description: 'A test', priority: 'high' })

        expect(res.status).toBe(201)
        expect(res.body.title).toBe('Test Card')
        expect(res.body.listId).toBe(listId)
        expect(res.body.priority).toBe('high')
        cardId = res.body.id
    })

    it('rechaza sin autenticación', async () => {
        const res = await supertest(app)
            .post(`/api/lists/${listId}/cards`)
            .send({ title: 'No Auth' })

        expect(res.status).toBe(401)
    })
})

describe('GET /api/lists/:listId/cards', () => {
    it('devuelve las tarjetas de la lista', async () => {
        const res = await supertest(app)
            .get(`/api/lists/${listId}/cards`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThanOrEqual(1)
    })
})

describe('GET /api/cards/:id', () => {
    it('devuelve una tarjeta por id', async () => {
        const res = await supertest(app)
            .get(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.id).toBe(cardId)
    })

    it('devuelve 404 si no existe', async () => {
        const res = await supertest(app)
            .get('/api/cards/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(404)
    })
})

describe('PATCH /api/cards/:id', () => {
    it('actualiza el título de la tarjeta', async () => {
        const res = await supertest(app)
            .patch(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title', expectedVersion: 1 })

        expect(res.status).toBe(200)
        expect(res.body.title).toBe('Updated Title')
    })

    it('rechaza con version incorrecta (conflicto)', async () => {
        const res = await supertest(app)
            .patch(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Conflict', expectedVersion: 999 })

        expect(res.status).toBe(409)
        expect(res.body.error.code).toBe('CONFLICT')
    })
})

describe('POST /api/cards/:id/move', () => {
    it('mueve la tarjeta a otra lista', async () => {
        const listRes2 = await pool.query("INSERT INTO lists (board_id, name, position) VALUES ((SELECT board_id FROM lists WHERE id = $1), 'Done', 1) RETURNING *", [listId])
        const targetListId = listRes2.rows[0].id

        const res = await supertest(app)
            .post(`/api/cards/${cardId}/move`)
            .set('Authorization', `Bearer ${token}`)
            .send({ targetListId, newPosition: 0, expectedVersion: 2 })

        expect(res.status).toBe(200)
        expect(res.body.listId).toBe(targetListId)
    })
})

describe('GET /api/cards/search', () => {
    it('busca tarjetas por texto', async () => {
        const res = await supertest(app)
            .get('/api/cards/search?q=Updated')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.some((c: any) => c.title.includes('Updated'))).toBe(true)
    })

    it('devuelve array vacío si no hay resultados', async () => {
        const res = await supertest(app)
            .get('/api/cards/search?q=zzzzzzzzzz')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })
})

describe('DELETE /api/cards/:id', () => {
    it('elimina la tarjeta', async () => {
        const res = await supertest(app)
            .delete(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(204)
    })

    it('devuelve 404 si ya fue eliminada', async () => {
        const res = await supertest(app)
            .delete(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(404)
    })
})
