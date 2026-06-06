const API = 'http://localhost:3000'

let token: string | null = null

function headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? 'Login failed')
    token = data.accessToken
    return data
}

export async function register(email: string, password: string, name: string) {
    const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? 'Register failed')
    token = data.accessToken
    return data
}

export async function getCards(listId: string) {
    const res = await fetch(`${API}/api/lists/${listId}/cards`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to fetch cards')
    return res.json()
}

export async function searchCards(query: string) {
    const res = await fetch(`${API}/api/cards/search?q=${encodeURIComponent(query)}`, { headers: headers() })
    if (!res.ok) throw new Error('Search failed')
    return res.json()
}

export async function createCard(listId: string, title: string, description: string, priority: string) {
    const res = await fetch(`${API}/api/lists/${listId}/cards`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ title, description, priority }),
    })
    if (!res.ok) throw new Error('Create failed')
    return res.json()
}

export async function deleteCard(cardId: string) {
    const res = await fetch(`${API}/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: headers(),
    })
    if (!res.ok) throw new Error('Delete failed')
}

export function getToken() { return token }
