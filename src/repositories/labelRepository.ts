import { pool } from '../db/pool.js'

export interface Label {
    id: string
    name: string
    color: string
}

export async function createLabel(name: string, color: string): Promise<Label> {
    const result = await pool.query(
        'INSERT INTO labels (name, color) VALUES ($1, $2) RETURNING *',
        [name, color]
    )
    return result.rows[0]
}

export async function findAllLabels(): Promise<Label[]> {
    const result = await pool.query('SELECT * FROM labels ORDER BY name ASC')
    return result.rows
}

export async function addLabelToCard(cardId: string, labelId: string): Promise<void> {
    await pool.query(
        'INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [cardId, labelId]
    )
}

export async function removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
    await pool.query(
        'DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2',
        [cardId, labelId]
    )
}