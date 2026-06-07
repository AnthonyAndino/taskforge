import { Router, type Request, type Response } from 'express'
import { createList, findListsByBoardId, updateList, deleteList } from '../repositories/listRepository.js'
import { authMiddleware } from '../middleware/auth.js'
import { AppError } from '../errors/AppError.js'

const router = Router()

router.get('/boards/:boardId/lists', authMiddleware, async (req: Request, res: Response) => {
    const boardId = req.params['boardId'] as string
    const lists = await findListsByBoardId(boardId)
    res.json(lists)
})

router.post('/boards/:boardId/lists', authMiddleware, async (req: Request, res: Response) => {
    const boardId = req.params['boardId'] as string
    const { name } = req.body as { name?: string }
    if (!name?.trim()) throw new AppError(400, 'BAD_REQUEST', 'List name is required')
    const list = await createList(boardId, name.trim())
    res.status(201).json(list)
})

router.patch('/lists/:id', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params['id'] as string
    const { name } = req.body as { name?: string }
    if (!name?.trim()) throw new AppError(400, 'BAD_REQUEST', 'List name is required')
    const list = await updateList(id, name.trim())
    if (!list) throw new AppError(404, 'NOT_FOUND', 'List not found')
    res.json(list)
})

router.delete('/lists/:id', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params['id'] as string
    const deleted = await deleteList(id)
    if (!deleted) throw new AppError(404, 'NOT_FOUND', 'List not found')
    res.status(204).send()
})

export default router
