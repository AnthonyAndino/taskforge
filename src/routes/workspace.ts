import { Router, type Request, type Response } from 'express'
import { createWorkspace, findAllWorkspaces } from '../repositories/workspaceRepository.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../errors/AppError.js'

const router = Router()

router.get('/workspaces', authMiddleware, async (req: Request, res: Response) => {
    const workspaces = await findAllWorkspaces()
    res.json(workspaces)
})

router.post('/workspaces', authMiddleware, async (req: Request, res: Response) => {
    const { name } = req.body as { name?: string }
    if (!name?.trim()) throw new AppError(400, 'BAD_REQUEST', 'Name is required')

    // Auto-generate slug from name
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    try {
        const workspace = await createWorkspace(name.trim(), slug)
        res.status(201).json(workspace)
    } catch (err: any) {
        if (err.code === '23505') throw new AppError(409, 'CONFLICT', 'Workspace with that name already exists')
        throw err
    }
})

export default router
