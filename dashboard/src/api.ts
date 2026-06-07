const API = 'http://localhost:3000'

let token: string | null = localStorage.getItem('tf_token')

function headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options?.headers ?? {}) } })
    if (res.status === 204) return undefined as T
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? `Request failed: ${res.status}`)
    return data as T
}

export async function login(email: string, password: string) {
    const data = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    token = data.accessToken
    localStorage.setItem('tf_token', token!)
    return data
}

export async function register(email: string, password: string, name: string) {
    const data = await request<any>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })
    token = data.accessToken
    localStorage.setItem('tf_token', token!)
    return data
}

export function logout() {
    token = null
    localStorage.removeItem('tf_token')
}

export function getToken() { return token }

// ===== Workspaces =====
export async function getWorkspaces() {
    return request<any[]>('/api/workspaces')
}
export async function createWorkspace(name: string) {
    return request<any>('/api/workspaces', { method: 'POST', body: JSON.stringify({ name }) })
}

// ===== Boards =====
export async function getBoards(workspaceId: string) {
    return request<any[]>(`/api/workspaces/${workspaceId}/boards`)
}
export async function createBoard(workspaceId: string, name: string) {
    return request<any>(`/api/workspaces/${workspaceId}/boards`, { method: 'POST', body: JSON.stringify({ name }) })
}

// ===== Lists =====
export async function getLists(boardId: string) {
    return request<any[]>(`/api/boards/${boardId}/lists`)
}
export async function createList(boardId: string, name: string) {
    return request<any>(`/api/boards/${boardId}/lists`, { method: 'POST', body: JSON.stringify({ name }) })
}
export async function updateList(listId: string, name: string) {
    return request<any>(`/api/lists/${listId}`, { method: 'PATCH', body: JSON.stringify({ name }) })
}
export async function deleteList(listId: string) {
    return request<void>(`/api/lists/${listId}`, { method: 'DELETE' })
}

// ===== Cards =====
export async function getCards(listId: string) {
    return request<any[]>(`/api/lists/${listId}/cards`)
}
export async function searchCards(query: string) {
    return request<any[]>(`/api/cards/search?q=${encodeURIComponent(query)}`)
}
export async function createCard(listId: string, title: string, description: string, priority: string) {
    return request<any>(`/api/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify({ title, description, priority }) })
}
export async function updateCard(cardId: string, fields: { title?: string; description?: string; priority?: string }, expectedVersion: number) {
    return request<any>(`/api/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify({ ...fields, expectedVersion }) })
}
export async function moveCard(cardId: string, targetListId: string, expectedVersion: number) {
    return request<any>(`/api/cards/${cardId}/move`, { method: 'POST', body: JSON.stringify({ targetListId, newPosition: 0, expectedVersion }) })
}
export async function deleteCard(cardId: string) {
    return request<void>(`/api/cards/${cardId}`, { method: 'DELETE' })
}

// ===== Labels =====
export async function getLabels() {
    return request<any[]>('/api/labels')
}
export async function createLabel(name: string, color: string) {
    return request<any>('/api/labels', { method: 'POST', body: JSON.stringify({ name, color }) })
}
