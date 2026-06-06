import express from "express"
import cors from "cors"
import { notFound } from "./middleware/notFound.js"
import { errorHandler } from "./middleware/errorHandler.js"
import healthRouter from './routes/health.js'
import pingRouter from './routes/ping.js'
import authRouter from './routes/auth.js'
import cardRouter from './routes/card.js'
import labelRouter from './routes/label.js'

export const app = express()

app.use(cors())
app.use(express.json())
app.use('/health', healthRouter)
app.use('/api/ping', pingRouter)
app.use('/auth', authRouter)
app.use('/api', cardRouter)
app.use('/api', labelRouter)
app.use(notFound)
app.use(errorHandler)

