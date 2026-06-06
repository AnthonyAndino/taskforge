import { describe, it, expect, beforeAll } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { pool } from '../src/db/pool.js'

beforeAll(async () => {
    await pool.query('TRUNCATE TABLE users CASCADE')
})

describe('POST /auth/register', () => {
    it('registra un usuario y devuelve token + user', async () => {

        const response = await supertest(app)
            .post('/auth/register')
            .send({ email: 'test@test.com', password: '123456', name: 'Test' })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
        expect(response.body).toHaveProperty('user')
        expect(response.body.user.email).toBe('test@test.com')
    })
    
    it('rechaza email duplicado con 409', async () => {
        await supertest(app)
            .post('/auth/register')
            .send({ email: 'duplicate@test.com', password: '123456', name: 'Test' })

        const response = await supertest(app)
            .post('/auth/register')
            .send({ email: 'duplicate@test.com', password: '123456', name: 'Test' })

        expect(response.status).toBe(409)
        expect(response.body.error.code).toBe('CONFLICT')
    })

    it('loguea con credenciales correctas', async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({ email: 'test@test.com', password: '123456'})

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
        expect(response.body.user.email).toBe('test@test.com')
    })

    it('rechaza email incorrecto con 401', async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({ email: 'noexiste@test.com', password: '123456' })

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('rechaza password incorrecta con 401', async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({ email: 'test@test.com', password: 'wrongpass' })
        
        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('accede a ruta protegida con token valido', async () => {
        const registerRes = await supertest(app)
            .post('/auth/register')
            .send({ email: 'midware@test.com', password: '123456', name: 'Test' })

        const token = registerRes.body.accessToken

        const response = await supertest(app)
            .get('/api/ping/me')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('userId')
    })

    it('rechaza ruta protegida sin token', async () => {
        const response = await supertest(app)
            .get('/api/ping/me')

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('rechaza ruta protegida con token invalido', async () => {
        const response = await supertest(app)
            .get('/api/ping/me')
            .set('Authorization', 'Bearer token-invalido')

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('refresca el access token con refresh token valido', async () => {
        const registerRes = await supertest(app)
            .post('/auth/register')
            .send({ email: 'refresh@test.com', password: '123456', name: 'Test' })

        const refreshToken = registerRes.body.refreshToken

        const response = await supertest(app)
            .post('/auth/refresh')
            .send({ refreshToken })
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
    })

    it('rechaza refresh token invalido con 401', async () => {
        const response = await supertest(app)
            .post('/auth/refresh')
            .send({ refreshToken: 'token-invalido' })

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

})

