import { Router, Response, Request } from 'express'
import { ping }  from '../services/ping.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
    const result = ping()
    res.json(result)
})

router.get('/me', authMiddleware, (req: Request, res: Response) => {
    res.json({ userId: (req as any).userId })
})

export default router
