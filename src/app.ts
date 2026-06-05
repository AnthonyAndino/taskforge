import express from "express"
import { notFound } from "./middleware/notFound.js"
import { errorHandler } from "./middleware/errorHandler.js"
import healthRouter from './routes/health.js'
import pingRouter from './routes/ping.js'
import authRouter from './routes/auth.js'

export const app = express()

app.use(express.json())
app.use('/health', healthRouter)
app.use('/api/ping', pingRouter)
app.use('/auth', authRouter)
app.use(notFound)
app.use(errorHandler)

