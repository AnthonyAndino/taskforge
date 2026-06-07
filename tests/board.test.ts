import { describe, it, expect, beforeAll } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { pool } from '../src/db/pool.js'

let token: string
let workspaceId: string
let boardId: string
let listId: string

beforeAll(async () => {
    await pool.query('TRUNCATE TABLE users, workspaces, boards, lists, cards, card_labels, activity_log CASCADE')

    const registerRes = await supertest(app)
        .post('/auth/register')
        .send({ email: 'board-test@test.com', password: '123456', name: 'Board Tester' })
    token = registerRes.body.accessToken
})

describe('Workspaces Endpoints', () => {
    it('should create a workspace', async () => {
        const res = await supertest(app)
            .post('/api/workspaces')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Personal Workspace' })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Personal Workspace')
        expect(res.body.slug).toBe('personal-workspace')
        expect(res.body.id).toBeDefined()
        workspaceId = res.body.id
    })

    it('should get all workspaces', async () => {
        const res = await supertest(app)
            .get('/api/workspaces')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThanOrEqual(1)
        expect(res.body[0].name).toBe('Personal Workspace')
    })

    it('should reject creating a workspace without name', async () => {
        const res = await supertest(app)
            .post('/api/workspaces')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: '' })

        expect(res.status).toBe(400)
    })
})

describe('Boards Endpoints', () => {
    it('should create a board in a workspace', async () => {
        const res = await supertest(app)
            .post(`/api/workspaces/${workspaceId}/boards`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Development Board' })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Development Board')
        expect(res.body.workspaceId).toBe(workspaceId)
        expect(res.body.id).toBeDefined()
        boardId = res.body.id
    })

    it('should get boards of a workspace', async () => {
        const res = await supertest(app)
            .get(`/api/workspaces/${workspaceId}/boards`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThanOrEqual(1)
        expect(res.body[0].name).toBe('Development Board')
    })
})

describe('Lists Endpoints', () => {
    it('should create a list in a board', async () => {
        const res = await supertest(app)
            .post(`/api/boards/${boardId}/lists`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'To Do' })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('To Do')
        expect(res.body.boardId).toBe(boardId)
        expect(res.body.id).toBeDefined()
        listId = res.body.id
    })

    it('should get lists of a board', async () => {
        const res = await supertest(app)
            .get(`/api/boards/${boardId}/lists`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThanOrEqual(1)
        expect(res.body[0].name).toBe('To Do')
    })

    it('should update list properties', async () => {
        const res = await supertest(app)
            .patch(`/api/lists/${listId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Done' })

        expect(res.status).toBe(200)
        expect(res.body.name).toBe('Done')
    })

    it('should delete a list', async () => {
        const res = await supertest(app)
            .delete(`/api/lists/${listId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(204)

        // Verify it's gone
        const checkRes = await supertest(app)
            .get(`/api/boards/${boardId}/lists`)
            .set('Authorization', `Bearer ${token}`)
        expect(checkRes.body.find((l: any) => l.id === listId)).toBeUndefined()
    })
})
