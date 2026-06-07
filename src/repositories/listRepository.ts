import { pool } from '../db/pool.js'

export interface List {
    id: string
    boardId: string
    name: string
    position: number
    createdAt: Date
}

function mapList(row: any): List {
    return {
        id: row.id,
        boardId: row.board_id,
        name: row.name,
        position: row.position,
        createdAt: row.created_at,
    }
}

export async function createList(boardId: string, name: string): Promise<List> {
    const result = await pool.query(
        `INSERT INTO lists (board_id, name, position) 
         VALUES ($1, $2, COALESCE((SELECT MAX(position) + 1 FROM lists WHERE board_id = $1), 0)) 
         RETURNING *`,
        [boardId, name]
    )
    return mapList(result.rows[0])
}

export async function findListsByBoardId(boardId: string): Promise<List[]> {
    const result = await pool.query(
        'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
        [boardId]
    )
    return result.rows.map(mapList)
}

export async function findListById(id: string): Promise<List | undefined> {
    const result = await pool.query(
        'SELECT * FROM lists WHERE id = $1',
        [id]
    )
    return result.rows[0] ? mapList(result.rows[0]) : undefined
}

export async function updateList(id: string, name: string): Promise<List | undefined> {
    const result = await pool.query(
        'UPDATE lists SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
    )
    return result.rows[0] ? mapList(result.rows[0]) : undefined
}

export async function deleteList(id: string): Promise<boolean> {
    // Delete cards in this list first to be safe, though DB cascade should handle it
    await pool.query('DELETE FROM cards WHERE list_id = $1', [id])
    const result = await pool.query('DELETE FROM lists WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
}
