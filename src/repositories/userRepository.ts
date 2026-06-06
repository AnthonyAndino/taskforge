import { pool } from '../db/pool.js'

export interface User {
    id: string
    email: string
    password: string
    name: string
    createdAt: Date
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
    const result = await pool.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *', [email, password, name]
    )
    return result.rows[0]
}

export async function findByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1', [email]
    )
    return result.rows[0] ?? undefined
} 
