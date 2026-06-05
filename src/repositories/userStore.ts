export interface User {
    id: string
    email: string
    password: string
    name: string
    createdAt: Date
}

const users = new Map<string, User>()

export function createUser(email: string, password: string, name: string): User {
    const id = crypto.randomUUID()
    const user: User = { id, email, password, name, createdAt: new Date() }
    users.set(id, user)
    return user
}

export function findByEmail(email: string): User | undefined {
    return Array.from(users.values()).find(u => u.email === email)
}

