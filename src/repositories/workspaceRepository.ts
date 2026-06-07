import { pool } from '../db/pool.js'

export interface Workspace {
    id: string
    name: string
    slug: string
    createdAt: Date
}

function mapWorkspace(row: any): Workspace {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        createdAt: row.created_at,
    }
}

export async function createWorkspace(name: string, slug: string): Promise<Workspace> {
    const result = await pool.query(
        'INSERT INTO workspaces (name, slug) VALUES ($1, $2) RETURNING *',
        [name, slug]
    )
    return mapWorkspace(result.rows[0])
}

export async function findAllWorkspaces(): Promise<Workspace[]> {
    const result = await pool.query(
        'SELECT * FROM workspaces ORDER BY name ASC'
    )
    return result.rows.map(mapWorkspace)
}

export async function findWorkspaceById(id: string): Promise<Workspace | undefined> {
    const result = await pool.query(
        'SELECT * FROM workspaces WHERE id = $1',
        [id]
    )
    return result.rows[0] ? mapWorkspace(result.rows[0]) : undefined
}
