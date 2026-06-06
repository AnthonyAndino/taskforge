import { Router, type Request, type Response } from 'express'
import { refreshAccessToken, registerUser } from '../services/auth.js'
import { loginUser } from '../services/auth.js'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body
    const result = await registerUser(email, password, name)
    res.json(result)
})

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body
    const result = await loginUser(email, password)
    res.json(result)
})

router.post('/refresh', (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const result = refreshAccessToken(refreshToken)
    res.json(result)
})

export default router 