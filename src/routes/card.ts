import { Router, type Request, type Response } from 'express'
import { createCardInList, getCardsByListId, getCardById, updateCardById, deleteCardById, moveCardToList, searchCardsByQuery } from '../services/card.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/lists/:listId/cards', authMiddleware, async (req: Request, res: Response) => {
    const { listId } = req.params
    const { title, description, priority } = req.body
    const userId = (req as any).userId

    const card = await createCardInList(listId, title, description, priority ?? 'medium', userId)
    res.status(201).json(card)
})

router.get('/lists/:listId/cards', authMiddleware, async (req: Request, res: Response) => {
    const { listId } = req.params
    const cards = await getCardsByListId(listId)
    res.json(cards)
})

router.get('/cards/search', authMiddleware, async (req: Request, res: Response) => {
    const query = req.query.q as string
    const cards = await searchCardsByQuery(query)
    res.json(cards)
})

router.get('/cards/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params
    const card = await getCardById(id)
    res.json(card)
})

router.patch('/cards/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, description, priority, dueDate, expectedVersion } = req.body
    const userId = (req as any).userId

    const card = await updateCardById(id, { title, description, priority, dueDate }, userId, expectedVersion)
    res.json(card)
})

router.delete('/cards/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = (req as any).userId

    await deleteCardById(id, userId)
    res.status(204).send()
})

router.post('/cards/:id/move', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params
    const { targetListId, newPosition, expectedVersion } = req.body
    const userId = (req as any).userId

    const card = await moveCardToList(id, targetListId, newPosition, userId, expectedVersion)
    res.json(card)
})

export default router
