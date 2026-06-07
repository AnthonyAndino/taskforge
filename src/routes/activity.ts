import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { pool } from '../db/pool.js'

const router = Router()

router.get('/activity', authMiddleware, async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query['limit'] ?? 30), 100)
    const result = await pool.query(
        `SELECT al.*, u.name as actor_name
         FROM activity_log al
         LEFT JOIN users u ON u.id = al.actor_id
         ORDER BY al.created_at DESC
         LIMIT $1`,
        [limit]
    )
    const items = result.rows.map((row: any) => ({
        id: row.id,
        actorId: row.actor_id,
        actorName: row.actor_name ?? 'Unknown',
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        metadata: row.metadata,
        createdAt: row.created_at,
    }))
    res.json(items)
})

export default router
