import { pool } from '../db/pool.js'

export interface Card {
    id: string
    listId: string
    title: string
    description: string
    position: number
    dueDate: Date | null
    priority: 'low' | 'medium' | 'high' | 'urgent'
    version: number
    createdAt: Date
    updatedAt: Date
}

function mapCard(row: any): Card {
    return {
        id: row.id,
        listId: row.list_id,
        title: row.title,
        description: row.description,
        position: row.position,
        dueDate: row.due_date ?? null,
        priority: row.priority,
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function createCard(
    listId: string,
    title: string,
    description: string,
    priority: Card['priority']
): Promise<Card> {
    const result = await pool.query(
        `INSERT INTO cards (list_id, title, description, position, priority)
         VALUES ($1, $2, $3, COALESCE((SELECT MAX(position) + 1 FROM cards WHERE list_id = $1), 0), $4)
         RETURNING *`,
        [listId, title, description, priority]
    )
    return mapCard(result.rows[0])
}

export async function findById(id: string): Promise<Card | undefined> {
    const result = await pool.query('SELECT * FROM cards WHERE id = $1', [id])
    return result.rows[0] ? mapCard(result.rows[0]) : undefined
}

export async function findCardsByListId(listId: string): Promise<Card[]> {
    const result = await pool.query(
        'SELECT * FROM cards WHERE list_id = $1 ORDER BY position ASC',
        [listId]
    )
    return result.rows.map(mapCard)
}

export async function updateCard(
    id: string,
    fields: { title?: string; description?: string; priority?: Card['priority']; dueDate?: Date | null },
    expectedVersion: number
): Promise<Card | undefined> {
    const setClauses: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (fields.title !== undefined) {
        setClauses.push(`title = $${paramIndex++}`)
        values.push(fields.title)
    }
    if (fields.description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`)
        values.push(fields.description)
    }
    if (fields.priority !== undefined) {
        setClauses.push(`priority = $${paramIndex++}`)
        values.push(fields.priority)
    }
    if (fields.dueDate !== undefined) {
        setClauses.push(`due_date = $${paramIndex++}`)
        values.push(fields.dueDate)
    }

    if (setClauses.length === 0) return await findById(id)

    setClauses.push(`updated_at = now()`)
    setClauses.push(`version = version + 1`)

    values.push(id, expectedVersion)
    const result = await pool.query(
        `UPDATE cards SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND version = $${paramIndex++}
         RETURNING *`,
        values
    )
    return result.rows[0] ? mapCard(result.rows[0]) : undefined
}

export async function deleteCard(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM cards WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
}

export async function searchCards(query: string, limit = 20): Promise<Card[]> {
    const result = await pool.query(
        `SELECT * FROM cards
         WHERE search_vector @@ plainto_tsquery('spanish', $1)
         ORDER BY ts_rank(search_vector, plainto_tsquery('spanish', $1)) DESC
         LIMIT $2`,
        [query, limit]
    )
    return result.rows.map(mapCard)
}

export async function moveCard(
    id: string,
    targetListId: string,
    newPosition: number,
    expectedVersion: number
): Promise<Card | undefined> {
    await pool.query(
        `UPDATE cards SET position = position - 1 WHERE list_id = (SELECT list_id FROM cards WHERE id = $1) AND position > (SELECT position FROM cards WHERE id = $1)`,
        [id]
    )

    await pool.query(
        `UPDATE cards SET position = position + 1 WHERE list_id = $2 AND position >= $3 AND id != $1`,
        [id, targetListId, newPosition]
    )

    const result = await pool.query(
        `UPDATE cards SET list_id = $2, position = $3, version = version + 1, updated_at = now()
         WHERE id = $1 AND version = $4
         RETURNING *`,
        [id, targetListId, newPosition, expectedVersion]
    )
    return result.rows[0] ? mapCard(result.rows[0]) : undefined
}
