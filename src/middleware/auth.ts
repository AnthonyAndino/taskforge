import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError.js'

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }

    const token = header.split(' ')[1]

    try {
        const payload = jwt.verify(token, 'secret') as { userId: string };
        (req as any).userId = payload.userId
        next()
    } catch {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token')
    }
}