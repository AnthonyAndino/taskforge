import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, findByEmail } from '../repositories/userStore.js'
import { AppError } from '../errors/AppError.js'


export function generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, 'secret', { expiresIn: '1h' })
    const refreshToken = jwt.sign({ userId }, 'refreshSecret', {expiresIn: '7d' })

    return { accessToken, refreshToken }
}

export function registerUser(email: string, password: string, name: string) {
    const existing = findByEmail(email)

    if (existing) {
        throw new AppError(409, 'CONFLICT', 'Email alredy registered')
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const user = createUser(email, hashedPassword, name)
    const token = generateTokens(user.id)

    return { ...token, user }

}

export function loginUser(email: string, password: string) {
    const user = findByEmail(email)

    if (!user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password')
    }

    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password')
    }

    const token = generateTokens(user.id)

    return { ...token, user }
}

export function refreshAccessToken(refreshToken: string) {
    try {
        const payload = jwt.verify(refreshToken, 'refreshSecret') as { userId: string }

        const accessToken = jwt.sign({ userId: payload.userId }, 'secret', { expiresIn: '1h' })

        return { accessToken }
    } catch {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token')
    }
}

