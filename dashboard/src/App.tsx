import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import {
  login, register, getCards, searchCards, createCard,
  updateCard, deleteCard, getToken, logout as apiLogout
} from './api'
import mascotImg from './assets/manatee_mascot.png'
import './App.css'

/* ========== Types ========== */
interface Card {
  id: string
  listId: string
  title: string
  description: string
  position: number
  priority: string
  version: number
}

interface BoardColumn {
  listId: string
  name: string
  color: string
}

type AppView = 'landing' | 'auth' | 'dashboard'

const COLUMNS_KEY = 'taskforge_columns'
const THEME_KEY = 'taskforge_theme'
const COLUMN_COLORS = ['#2D9F93', '#E8735A', '#7C5CFC', '#4CAF7D', '#E5A54B', '#DC4F45']

function loadColumns(): BoardColumn[] {
  try {
    const saved = localStorage.getItem(COLUMNS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return [
    { listId: '00000000-0000-4000-a000-000000000004', name: 'To Do 🦦', color: '#2D9F93' },
    { listId: '00000000-0000-4000-a000-000000000005', name: 'In Progress ⚙️', color: '#E8735A' },
    { listId: '00000000-0000-4000-a000-000000000006', name: 'Done 🎉', color: '#7C5CFC' }
  ]
}
function saveColumns(cols: BoardColumn[]) {
  localStorage.setItem(COLUMNS_KEY, JSON.stringify(cols))
}

/* ========== SVG Icons ========== */
function IconForge() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  )
}
function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
}
function IconSun() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
}
function IconMoon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
}
function IconPlus() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
function IconX() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}
function IconLogout() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}
function IconBack() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
}
function IconBolt() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
}
function IconBoard() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
}
function IconTerminal() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
}
function IconSearchLg() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}

/* ========== Landing Page ========== */
function LandingPage({ onGetStarted, onLogin, theme, toggleTheme }: {
  onGetStarted: () => void
  onLogin: () => void
  theme: string
  toggleTheme: () => void
}) {
  const marqueeItems = [
    'Real-time Collaboration', 'Kanban Boards', 'WebSocket Events',
    'Full-text Search', 'CLI Client', 'JWT Authentication',
    'Activity Logging', 'Optimistic Concurrency', 'PostgreSQL',
    'Real-time Collaboration', 'Kanban Boards', 'WebSocket Events',
    'Full-text Search', 'CLI Client', 'JWT Authentication',
    'Activity Logging', 'Optimistic Concurrency', 'PostgreSQL',
  ]

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <IconForge />
          TaskForge
        </div>
        <div className="landing-nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          <button className="btn btn-ghost" onClick={onLogin}>Log In</button>
          <button className="btn btn-primary" onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            Open Source Project Management
          </div>
          <h1>
            <span className="gradient-text">Forge</span> Your<br />
            Productivity
          </h1>
          <p>
            Kanban-style project management with real-time collaboration,
            full-text search, and a CLI client — all powered by WebSockets
            and PostgreSQL.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Start Forging
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onLogin}>
              Log In
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <img src={mascotImg} alt="Forge the Manatee mascot" className="hero-mascot" />
        </div>
      </section>

      <div className="marquee-strip">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <div className="marquee-item" key={i}>
              <span />{item}
            </div>
          ))}
        </div>
      </div>

      <section className="features">
        <div className="features-header">
          <h2>Built for Modern Teams</h2>
          <p>Everything you need to manage projects and ship faster.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon teal"><IconBolt /></div>
            <h3>Real-time Sync</h3>
            <p>WebSocket-powered real-time updates. See changes from your team the instant they happen — no refresh needed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon coral"><IconBoard /></div>
            <h3>Kanban Boards</h3>
            <p>Organize tasks into customizable columns. Drag context, set priorities, and track progress visually.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green"><IconSearchLg /></div>
            <h3>Full-text Search</h3>
            <p>PostgreSQL-powered search with Spanish language support. Find any task instantly across all your boards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple"><IconTerminal /></div>
            <h3>CLI Client</h3>
            <p>Manage tasks from the terminal. Login, create, move, and search cards without leaving your workflow.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>TaskForge © {new Date().getFullYear()} — Built with Express, React, PostgreSQL & WebSockets</p>
      </footer>
    </div>
  )
}

/* ========== Auth Page ========== */
function AuthPage({ onLogin, onBack, theme, toggleTheme }: {
  onLogin: () => void
  onBack: () => void
  theme: string
  toggleTheme: () => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      onLogin()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="btn btn-ghost auth-back" onClick={onBack} title="Back to home">
          <IconBack />
        </button>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>
        <div className="auth-header">
          <div className="auth-logo">
            <IconForge />
            TaskForge
          </div>
          <p>{mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="label" htmlFor="auth-name">Name</label>
              <input id="auth-name" className="input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label className="label" htmlFor="auth-email">Email</label>
            <input id="auth-email" className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <div className="spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => { setMode('register'); setError('') }}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError('') }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}

/* ========== Card Edit Modal ========== */
function CardEditModal({ card, onSave, onClose }: {
  card: Card
  onSave: (updated: Card) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [priority, setPriority] = useState(card.priority)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const updated = await updateCard(card.id, { title, description, priority }, card.version)
      onSave(updated)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Card</h3>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="label">Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" rows={3} style={{ resize: 'vertical', minHeight: 60 }} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Priority</label>
            <select className="select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          {error && <div className="auth-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <div className="spinner" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ========== Add Column Modal ========== */
function AddColumnModal({ onAdd, onClose, nextColor }: {
  onAdd: (col: BoardColumn) => void
  onClose: () => void
  nextColor: string
}) {
  const [listId, setListId] = useState('')
  const [name, setName] = useState('')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!listId.trim() || !name.trim()) return
    onAdd({ listId: listId.trim(), name: name.trim(), color: nextColor })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Column</h3>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>
        <form onSubmit={handleAdd}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Column Name</label>
              <input className="input" placeholder='e.g. "To Do", "In Progress"' value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">List ID (UUID)</label>
              <input className="input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={listId} onChange={e => setListId(e.target.value)} required />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Paste the UUID of an existing list from your PostgreSQL database.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" type="submit">Add Column</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========== Task Card Component ========== */
function TaskCard({ card, onEdit, onDelete }: {
  card: Card
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="task-card" onDoubleClick={onEdit}>
      <div className={`task-card-priority ${card.priority}`} />
      <div className="task-card-title">{card.title}</div>
      {card.description && <div className="task-card-desc">{card.description}</div>}
      <div className="task-card-footer">
        <span className={`priority-badge ${card.priority}`}>{card.priority}</span>
        <div className="task-card-actions">
          <button onClick={e => { e.stopPropagation(); onEdit() }} title="Edit"><IconEdit /></button>
          <button className="delete-action" onClick={e => { e.stopPropagation(); onDelete() }} title="Delete"><IconTrash /></button>
        </div>
      </div>
      <div className="task-card-id">{card.id.slice(0, 8)}</div>
    </div>
  )
}

/* ========== Kanban Column ========== */
function KanbanColumn({ column, onRemove }: {
  column: BoardColumn
  onRemove: () => void
}) {
  const [cards, setCards] = useState<Card[]>([])
  const [addingCard, setAddingCard] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  const loadCards = useCallback(async () => {
    try {
      const data = await getCards(column.listId)
      setCards(data)
    } catch { /* column might not exist yet */ }
  }, [column.listId])

  useEffect(() => { loadCards() }, [loadCards])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const card = await createCard(column.listId, newTitle.trim(), '', newPriority)
      setCards(prev => [...prev, card])
      setNewTitle('')
      setAddingCard(false)
    } catch { }
  }

  async function handleDelete(cardId: string) {
    try {
      await deleteCard(cardId)
      setCards(prev => prev.filter(c => c.id !== cardId))
    } catch { }
  }

  function handleCardSaved(updated: Card) {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
    setEditingCard(null)
  }

  return (
    <>
      <div className="kanban-col">
        <div className="col-header">
          <div className="col-color-dot" style={{ background: column.color }} />
          <h3>{column.name}</h3>
          <span className="col-count">{cards.length}</span>
          <button className="col-remove" onClick={onRemove} title="Remove column"><IconX /></button>
        </div>

        <div className="col-cards">
          {cards.map(card => (
            <TaskCard
              key={card.id}
              card={card}
              onEdit={() => setEditingCard(card)}
              onDelete={() => handleDelete(card.id)}
            />
          ))}
        </div>

        <div className="add-card-form">
          {!addingCard ? (
            <button className="add-card-trigger" onClick={() => setAddingCard(true)}>
              <IconPlus /> Add a card
            </button>
          ) : (
            <form className="add-card-expanded" onSubmit={handleCreate}>
              <input
                className="input"
                placeholder="Card title..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
              />
              <div className="add-card-row">
                <select className="select" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button className="btn btn-primary btn-sm" type="submit">Add</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddingCard(false)}>
                  <IconX />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {editingCard && (
        <CardEditModal
          card={editingCard}
          onSave={handleCardSaved}
          onClose={() => setEditingCard(null)}
        />
      )}
    </>
  )
}

/* ========== Dashboard ========== */
function Dashboard({ onLogout, theme, toggleTheme }: {
  onLogout: () => void
  theme: string
  toggleTheme: () => void
}) {
  const [columns, setColumns] = useState<BoardColumn[]>(loadColumns)
  const [showAddCol, setShowAddCol] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Card[] | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const searchTimeoutRef = useRef<any>(null)

  /* Save columns to localStorage */
  useEffect(() => { saveColumns(columns) }, [columns])

  /* WebSocket */
  useEffect(() => {
    const token = getToken()
    if (!token) return

    let ws: WebSocket
    let reconnectTimer: ReturnType<typeof setTimeout>

    function connect() {
      ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`)
      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => {
        setWsConnected(false)
        reconnectTimer = setTimeout(connect, 5000)
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [])

  function addColumn(col: BoardColumn) {
    setColumns(prev => [...prev, col])
    setShowAddCol(false)
  }

  function removeColumn(idx: number) {
    setColumns(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    clearTimeout(searchTimeoutRef.current)
    if (!value.trim()) {
      setSearchResults(null)
      return
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchCards(value.trim())
        setSearchResults(results)
      } catch {
        setSearchResults([])
      }
    }, 400)
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchResults(null)
  }

  const nextColor = COLUMN_COLORS[columns.length % COLUMN_COLORS.length]

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <IconForge />
          TaskForge
        </div>

        <div className="dash-search">
          <span className="dash-search-icon"><IconSearch /></span>
          <input
            className="input"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="dash-header-actions">
          <div className="ws-indicator">
            <div className={`ws-dot ${wsConnected ? 'connected' : ''}`} />
            {wsConnected ? 'Live' : 'Offline'}
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { apiLogout(); onLogout() }}>
            <IconLogout /> Logout
          </button>
        </div>
      </header>

      {/* Search Results */}
      {searchResults && (
        <>
          <div className="search-results-overlay" onClick={clearSearch} />
          <div className="search-results-panel">
            <div className="search-results-header">
              <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
              <button className="btn btn-ghost btn-sm" onClick={clearSearch}><IconX /> Close</button>
            </div>
            {searchResults.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
                No cards found for "{searchQuery}"
              </div>
            )}
            {searchResults.map(card => (
              <div key={card.id} className="search-result-card">
                <h4>{card.title}</h4>
                <p>
                  <span className={`priority-badge ${card.priority}`} style={{ marginRight: 8 }}>{card.priority}</span>
                  {card.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Board */}
      <div className="kanban-wrapper">
        <div className="kanban-toolbar">
          <h2>Board</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddCol(true)}>
            <IconPlus /> Add Column
          </button>
        </div>

        {columns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconBoard />
            </div>
            <h3>No columns yet</h3>
            <p>
              Add your first column by providing a List ID from your database to start organizing your tasks.
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddCol(true)}>
              <IconPlus /> Add Your First Column
            </button>
          </div>
        ) : (
          <div className="kanban-board">
            {columns.map((col, idx) => (
              <KanbanColumn
                key={col.listId}
                column={col}
                onRemove={() => removeColumn(idx)}
              />
            ))}
            <div className="add-col-card" onClick={() => setShowAddCol(true)}>
              <IconPlus />
              Add Column
            </div>
          </div>
        )}
      </div>

      {/* Add Column Modal */}
      {showAddCol && (
        <AddColumnModal
          onAdd={addColumn}
          onClose={() => setShowAddCol(false)}
          nextColor={nextColor}
        />
      )}
    </div>
  )
}

/* ========== App Root ========== */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken())
  const [view, setView] = useState<AppView>(loggedIn ? 'dashboard' : 'landing')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  function handleLogin() {
    setLoggedIn(true)
    setView('dashboard')
  }

  function handleLogout() {
    setLoggedIn(false)
    setView('landing')
  }

  if (view === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setView('auth')}
        onLogin={() => setView('auth')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    )
  }

  if (view === 'auth' || !loggedIn) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onBack={() => setView('landing')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    )
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )
}
