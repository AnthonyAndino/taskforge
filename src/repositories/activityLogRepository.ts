import { pool } from '../db/pool.js'

export interface ActivityLogEntry {
    id: string
    actorId: string
    action: string
    entityType: string
    entityId: string
    metadata: Record<string, unknown>
    createdAt: Date
}

export async function logActivity(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown> = {}
): Promise<ActivityLogEntry> {
    const result = await pool.query(
        `INSERT INTO activity_log (actor_id, action, entity_type, entity_id, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [actorId, action, entityType, entityId, JSON.stringify(metadata)]
    )
    return result.rows[0]
}

export async function getActivityForEntity(
    entityType: string,
    entityId: string
): Promise<ActivityLogEntry[]> {
    const result = await pool.query(
        'SELECT * FROM activity_log WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
        [entityType, entityId]
    )
    return result.rows
}