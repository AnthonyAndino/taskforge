import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                ...(err.details != null ? { details: err.details as Record<string, unknown> } : {}),
            },
        })
        return
    }
    
    console.error('Unhandled error:', err)
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    })
}

