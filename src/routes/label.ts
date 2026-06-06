import { Router, type Request, type Response } from 'express'
import { createNewLabel, getAllLabels, assignLabelToCard, unassignLabelFromCard } from '../services/label.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/labels', authMiddleware, async (req: Request, res: Response) => {
    const { name, color } = req.body
    const label = await createNewLabel(name, color)
    res.status(201).json(label)
})

router.get('/labels', authMiddleware, async (req: Request, res: Response) => {
    const labels = await getAllLabels()
    res.json(labels)
})

router.post('/cards/:cardId/labels/:labelId', authMiddleware, async (req: Request, res: Response) => {
    const { cardId, labelId } = req.params
    const userId = (req as any).userId

    await assignLabelToCard(cardId, labelId, userId)
    res.status(204).send()
})

router.delete('/cards/:cardId/labels/:labelId', authMiddleware, async (req: Request, res: Response) => {
    const { cardId, labelId } = req.params
    const userId = (req as any).userId

    await unassignLabelFromCard(cardId, labelId, userId)
    res.status(204).send()
})

export default router
