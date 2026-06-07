import { pool } from '../db/pool.js'

export interface Board {
    id: string
    workspaceId: string
    name: string
    createdAt: Date
}

function mapBoard(row: any): Board {
    return {
        id: row.id,
        workspaceId: row.workspace_id,
        name: row.name,
        createdAt: row.created_at,
    }
}

export async function createBoard(workspaceId: string, name: string): Promise<Board> {
    const result = await pool.query(
        'INSERT INTO boards (workspace_id, name) VALUES ($1, $2) RETURNING *',
        [workspaceId, name]
    )
    return mapBoard(result.rows[0])
}

export async function findBoardsByWorkspaceId(workspaceId: string): Promise<Board[]> {
    const result = await pool.query(
        'SELECT * FROM boards WHERE workspace_id = $1 ORDER BY name ASC',
        [workspaceId]
    )
    return result.rows.map(mapBoard)
}

export async function findBoardById(id: string): Promise<Board | undefined> {
    const result = await pool.query(
        'SELECT * FROM boards WHERE id = $1',
        [id]
    )
    return result.rows[0] ? mapBoard(result.rows[0]) : undefined
}
