const API = process.env.API_URL ?? 'http://localhost:3000'

let token: string | null = null

function headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
}

function saveToken(t: string) {
    token = t
    console.log('Token guardado')
}

async function fetchJSON(method: string, path: string, body?: unknown) {
    const res = await fetch(`${API}${path}`, {
        method,
        headers: headers(),
        body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }

    if (!res.ok) {
        console.error(`Error ${res.status}:`, data)
        process.exit(1)
    }
    return data
}

const commands: Record<string, (args: string[]) => Promise<void>> = {
    async login(args) {
        const [email, password] = args
        if (!email || !password) {
            console.error('Uso: login <email> <password>')
            return
        }
        const res = await fetchJSON('POST', '/auth/login', { email, password }) as any
        saveToken(res.accessToken)
        console.log('Login exitoso:', res.user.email)
    },

    async register(args) {
        const [email, password, name] = args
        if (!email || !password || !name) {
            console.error('Uso: register <email> <password> <name>')
            return
        }
        const res = await fetchJSON('POST', '/auth/register', { email, password, name }) as any
        saveToken(res.accessToken)
        console.log('Registrado:', res.user.email)
    },

    async lists(args) {
        const [listId] = args
        if (!listId) {
            console.error('Uso: lists <listId>')
            return
        }
        const cards = await fetchJSON('GET', `/api/lists/${listId}/cards`) as any[]
        if (cards.length === 0) {
            console.log('No hay tarjetas en esta lista')
            return
        }
        for (const c of cards) {
            console.log(`${c.position}. [${c.id.slice(0, 8)}] ${c.title} (${c.priority})`)
        }
    },

    async create(args) {
        const [listId, title, priority = 'medium'] = args
        if (!listId || !title) {
            console.error('Uso: create <listId> <title> [priority]')
            return
        }
        const card = await fetchJSON('POST', `/api/lists/${listId}/cards`, { title, description: '', priority }) as any
        console.log(`Creada tarjeta ${card.id.slice(0, 8)}: ${card.title}`)
    },

    async move(args) {
        const [cardId, targetListId, position = '0'] = args
        if (!cardId || !targetListId) {
            console.error('Uso: move <cardId> <targetListId> [position]')
            return
        }
        const card = await fetchJSON('POST', `/api/cards/${cardId}/move`, {
            targetListId,
            newPosition: Number(position),
            expectedVersion: 0,
        }) as any
        console.log(`Movida tarjeta ${card.id.slice(0, 8)} a lista ${targetListId.slice(0, 8)}`)
    },

    async search(args) {
        const query = args.join(' ')
        if (!query) {
            console.error('Uso: search <query>')
            return
        }
        const cards = await fetchJSON('GET', `/api/cards/search?q=${encodeURIComponent(query)}`) as any[]
        if (cards.length === 0) {
            console.log('Sin resultados')
            return
        }
        for (const c of cards) {
            console.log(`[${c.id.slice(0, 8)}] ${c.title}`)
        }
    },

    async help() {
        console.log(`
Comandos:
  login <email> <password>
  register <email> <password> <name>
  lists <listId>
  create <listId> <title> [priority]
  move <cardId> <targetListId> [position]
  search <query>
  help
        `.trim())
    },
}

const cmd = process.argv[2]
const args = process.argv.slice(3)

if (!cmd || cmd === 'help') {
    commands.help()
    process.exit(0)
}

if (!commands[cmd]) {
    console.error(`Comando desconocido: ${cmd}`)
    commands.help()
    process.exit(1)
}

commands[cmd](args).catch(console.error)
