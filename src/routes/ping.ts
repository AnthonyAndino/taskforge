import { Router } from 'express'
import { ping }  from '../services/ping.js'

const router = Router()

router.get('/', (req, res) => {
    const result = ping()
    res.json(result)
})

export default router
