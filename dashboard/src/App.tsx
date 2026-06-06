import { useState, useEffect, type FormEvent } from 'react'
import { login, register, getCards, searchCards, createCard, deleteCard, getToken } from './api'
import './App.css'

interface Card {
  id: string
  listId: string
  title: string
  description: string
  position: number
  priority: string
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      onLogin()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="login">
      <h1>TaskForge</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {isRegister && <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />}
        {error && <p className="error">{error}</p>}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button className="link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [listId, setListId] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [isSearching, setIsSearching] = useState(false)

  async function loadCards() {
    if (!listId) return
    try {
      const data = await getCards(listId)
      setCards(data)
      setIsSearching(false)
    } catch { }
  }

  useEffect(() => { loadCards() }, [listId])

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    try {
      const data = await searchCards(searchQuery)
      setCards(data)
      setIsSearching(true)
    } catch { }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !listId) return
    try {
      await createCard(listId, newTitle, '', newPriority)
      setNewTitle('')
      await loadCards()
    } catch { }
  }

  async function handleDelete(cardId: string) {
    try {
      await deleteCard(cardId)
      setCards(prev => prev.filter(c => c.id !== cardId))
    } catch { }
  }

  return (
    <div className="dashboard">
      <header>
        <h1>TaskForge</h1>
        <button onClick={onLogout}>Logout</button>
      </header>

      <div className="controls">
        <input
          placeholder="List ID (UUID)"
          value={listId}
          onChange={e => setListId(e.target.value)}
          className="list-input"
        />

        <form onSubmit={handleSearch} className="search-form">
          <input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          {isSearching && <button type="button" onClick={loadCards}>Clear</button>}
        </form>
      </div>

      <form onSubmit={handleCreate} className="create-form">
        <input
          placeholder="Card title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          required
        />
        <select value={newPriority} onChange={e => setNewPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit">Add Card</button>
      </form>

      <div className="card-list">
        {cards.length === 0 && <p className="empty">No cards found</p>}
        {cards.map(card => (
          <div key={card.id} className={`card priority-${card.priority}`}>
            <div className="card-header">
              <strong>{card.title}</strong>
              <span className={`badge ${card.priority}`}>{card.priority}</span>
              <button className="delete-btn" onClick={() => handleDelete(card.id)}>×</button>
            </div>
            {card.description && <p>{card.description}</p>}
            <small>Pos: {card.position} · ID: {card.id.slice(0, 8)}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken())

  return loggedIn ? (
    <Dashboard onLogout={() => { setLoggedIn(false) }} />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  )
}
