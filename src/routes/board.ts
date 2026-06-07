import { Router, type Request, type Response } from 'express'
import { createBoard, findBoardsByWorkspaceId } from '../repositories/boardRepository.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../errors/AppError.js'

const router = Router()

router.get('/workspaces/:workspaceId/boards', authMiddleware, async (req: Request, res: Response) => {
    const workspaceId = req.params['workspaceId'] as string
    const boards = await findBoardsByWorkspaceId(workspaceId)
    res.json(boards)
})

router.post('/workspaces/:workspaceId/boards', authMiddleware, async (req: Request, res: Response) => {
    const workspaceId = req.params['workspaceId'] as string
    const { name } = req.body as { name?: string }
    if (!name?.trim()) throw new AppError(400, 'BAD_REQUEST', 'Board name is required')
    const board = await createBoard(workspaceId, name.trim())
    res.status(201).json(board)
})

export default router
