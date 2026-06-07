import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import {
  login, register, getToken, logout as apiLogout,
  getWorkspaces, createWorkspace,
  getBoards, createBoard,
  getLists, createList, updateList, deleteList,
  getCards, searchCards, createCard, updateCard, deleteCard, moveCard, getActivity
} from './api'
import mascotImg from './assets/manatee_mascot.png'
import './App.css'

/* ===== Types ===== */
interface Workspace { id: string; name: string; slug: string }
interface Board { id: string; workspaceId: string; name: string }
interface BoardList { id: string; boardId: string; name: string; position: number }
interface Card { id: string; listId: string; title: string; description: string; position: number; priority: string; version: number; dueDate?: string | null }

type AppView = 'landing' | 'auth' | 'dashboard'
const THEME_KEY = 'taskforge_theme'
const COLUMN_COLORS = ['#2D9F93', '#E8735A', '#7C5CFC', '#4CAF7D', '#E5A54B', '#DC4F45']

/* ===== Icons ===== */
const Ico = {
  Forge: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Sun: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Plus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Logout: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Back: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Board: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Bolt: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Terminal: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Workspace: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Bell: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
}

/* ===== Priority Select Component (custom styled like the design image) ===== */
const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#4CAF7D' },
  { value: 'medium', label: 'Medium', color: '#E5A54B' },
  { value: 'high', label: 'High', color: '#E8735A' },
  { value: 'urgent', label: 'Urgent', color: '#DC4F45' },
]

function PrioritySelect({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = PRIORITIES.find(p => p.value === value) ?? PRIORITIES[1]!

  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="custom-select-wrap" ref={ref} id={id}>
      <button type="button" className="custom-select-trigger" onClick={() => setOpen(o => !o)}>
        <span className="prio-dot" style={{ background: current.color }} />
        <span className="custom-select-val">{current.label}</span>
        <span className="custom-select-arrow"><Ico.ChevronDown /></span>
      </button>
      {open && (
        <div className="custom-select-dropdown">
          {PRIORITIES.map(p => (
            <button key={p.value} type="button" className={`custom-select-option ${p.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(p.value); setOpen(false) }}>
              <span className="prio-dot" style={{ background: p.color }} />
              <span className="option-label">{p.label}</span>
              {p.value === value && <span className="option-check"><Ico.Check /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== Board Select Component ===== */
function BoardSelect({ boards, value, onChange }: { boards: Board[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = boards.find(b => b.id === value)

  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (boards.length === 0) return null

  return (
    <div className="custom-select-wrap board-select" ref={ref}>
      <button type="button" className="custom-select-trigger" onClick={() => setOpen(o => !o)}>
        <span className="board-icon"><Ico.Board /></span>
        <span className="custom-select-val">{current?.name ?? 'Select board'}</span>
        <span className="custom-select-arrow"><Ico.ChevronDown /></span>
      </button>
      {open && (
        <div className="custom-select-dropdown">
          {boards.map(b => (
            <button key={b.id} type="button" className={`custom-select-option ${b.id === value ? 'selected' : ''}`}
              onClick={() => { onChange(b.id); setOpen(false) }}>
              <span className="board-icon-sm"><Ico.Board /></span>
              <span className="option-label">{b.name}</span>
              {b.id === value && <span className="option-check"><Ico.Check /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== Modal ===== */
function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><Ico.X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ===== Card Edit Modal ===== */
function CardEditModal({ card, onSave, onClose }: { card: Card; onSave: (c: Card) => void; onClose: () => void }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [priority, setPriority] = useState(card.priority)
  const [dueDate, setDueDate] = useState<string | null>(card.dueDate ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!title.trim()) return
    setLoading(true); setError('')
    try { const updated = await updateCard(card.id, { title, description, priority, dueDate }, card.version); onSave(updated) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Edit Card" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <div className="spinner" /> : 'Save Changes'}
        </button>
      </>
    }>
      <div className="form-group">
        <label className="label">Title</label>
        <input id="edit-title" className="input" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <textarea id="edit-desc" className="input" rows={3} style={{ resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="label">Priority</label>
        <PrioritySelect id="edit-priority" value={priority} onChange={setPriority} />
      </div>
      <div className="form-group">
        <label className="label">Due Date</label>
        <input type="date" id="edit-due-date" className="input" value={dueDate ? dueDate.substring(0, 10) : ''} onChange={e => setDueDate(e.target.value || null)} />
      </div>
      {error && <div className="auth-error">{error}</div>}
    </Modal>
  )
}

/* ===== Create List Modal ===== */
function CreateListModal({ boardId, onCreated, onClose }: { boardId: string; onCreated: (l: BoardList) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    try { const list = await createList(boardId, name.trim()); onCreated(list) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="New Column" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="create-list-form" type="submit" disabled={loading}>
          {loading ? <div className="spinner" /> : 'Create Column'}
        </button>
      </>
    }>
      <form id="create-list-form" onSubmit={handle}>
        <div className="form-group">
          <label className="label">Column Name</label>
          <input id="list-name" className="input" placeholder='e.g. "Backlog", "In Review"' value={name} onChange={e => setName(e.target.value)} required autoFocus />
        </div>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </Modal>
  )
}

/* ===== Create Board Modal ===== */
function CreateBoardModal({ workspaceId, onCreated, onClose }: { workspaceId: string; onCreated: (b: Board) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    try { const board = await createBoard(workspaceId, name.trim()); onCreated(board) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="New Board" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="create-board-form" type="submit" disabled={loading}>
          {loading ? <div className="spinner" /> : 'Create Board'}
        </button>
      </>
    }>
      <form id="create-board-form" onSubmit={handle}>
        <div className="form-group">
          <label className="label">Board Name</label>
          <input id="board-name" className="input" placeholder='e.g. "Marketing Q3", "Sprint 12"' value={name} onChange={e => setName(e.target.value)} required autoFocus />
        </div>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </Modal>
  )
}

/* ===== Create Workspace Modal ===== */
function CreateWorkspaceModal({ onCreated, onClose }: { onCreated: (w: Workspace) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    try { const ws = await createWorkspace(name.trim()); onCreated(ws) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="New Workspace" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="create-ws-form" type="submit" disabled={loading}>
          {loading ? <div className="spinner" /> : 'Create Workspace'}
        </button>
      </>
    }>
      <form id="create-ws-form" onSubmit={handle}>
        <div className="form-group">
          <label className="label">Workspace Name</label>
          <input id="ws-name" className="input" placeholder='e.g. "Company HQ", "Personal Projects"' value={name} onChange={e => setName(e.target.value)} required autoFocus />
        </div>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </Modal>
  )
}

function formatDueDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

/* ===== Task Card ===== */
function TaskCard({ card, onEdit, onDelete }: { card: Card; onEdit: () => void; onDelete: () => void }) {
  const prio = PRIORITIES.find(p => p.value === card.priority)
  const [isDragging, setIsDragging] = useState(false)
  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onDoubleClick={onEdit}
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('application/json', JSON.stringify({ id: card.id, version: card.version, listId: card.listId }))
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => {
        setIsDragging(false)
      }}
    >
      <div className="task-card-priority-bar" style={{ background: prio?.color ?? '#E5A54B' }} />
      <div className="task-card-body">
        <div className="task-card-title">{card.title}</div>
        {card.description && <div className="task-card-desc">{card.description}</div>}
        <div className="task-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`priority-badge ${card.priority}`} style={{ borderColor: prio?.color, color: prio?.color }}>
              <span className="prio-dot-sm" style={{ background: prio?.color }} />
              {card.priority}
            </span>
            {card.dueDate && (
              <span className={`due-date-badge ${new Date(card.dueDate).getTime() < Date.now() ? 'overdue' : (new Date(card.dueDate).getTime() - Date.now() < 48*60*60*1000) ? 'due-soon' : ''}`} title="Due date">
                <ClockIcon />
                {formatDueDate(card.dueDate)}
              </span>
            )}
          </div>
          <div className="task-card-actions">
            <button id={`edit-card-${card.id.slice(0, 8)}`} onClick={e => { e.stopPropagation(); onEdit() }} title="Edit card"><Ico.Edit /></button>
            <button id={`del-card-${card.id.slice(0, 8)}`} className="delete-action" onClick={e => { e.stopPropagation(); onDelete() }} title="Delete card"><Ico.Trash /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== Kanban Column ===== */
function KanbanColumn({ list, colorIdx, onDeleted, wsEvent, onCardsChange }: {
  list: BoardList
  colorIdx: number
  onDeleted: () => void
  wsEvent: any
  onCardsChange: (columnId: string, cards: Card[]) => void
}) {
  const [cards, setCards] = useState<Card[]>([])
  const [addingCard, setAddingCard] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(list.name)
  const [loading, setLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const color = COLUMN_COLORS[colorIdx % COLUMN_COLORS.length]!

  const loadCards = useCallback(async () => {
    setLoading(true)
    try { const data = await getCards(list.id); setCards(data) }
    catch { }
    finally { setLoading(false) }
  }, [list.id])

  useEffect(() => { loadCards() }, [loadCards])

  // Notify parent of cards updates for stats
  useEffect(() => {
    onCardsChange(list.id, cards)
  }, [cards, list.id, onCardsChange])

  // Listen to local drag and drop movements
  useEffect(() => {
    function handleLocalMove(e: Event) {
      const { card, sourceListId } = (e as CustomEvent).detail
      if (card.listId === list.id) {
        setCards(prev => prev.some(c => c.id === card.id) ? prev : [...prev, card].sort((a, b) => a.position - b.position))
      } else if (sourceListId === list.id) {
        setCards(prev => prev.filter(c => c.id !== card.id))
      }
    }
    window.addEventListener('card-moved-local', handleLocalMove)
    return () => window.removeEventListener('card-moved-local', handleLocalMove)
  }, [list.id])

  // React to real-time websocket events
  useEffect(() => {
    if (!wsEvent) return
    if (wsEvent.type === 'card.created' && wsEvent.payload.listId === list.id) {
      setCards(prev => prev.some(c => c.id === wsEvent.payload.id) ? prev : [...prev, wsEvent.payload])
    } else if (wsEvent.type === 'card.updated') {
      setCards(prev => prev.map(c => c.id === wsEvent.payload.id ? wsEvent.payload : c))
    } else if (wsEvent.type === 'card.deleted') {
      setCards(prev => prev.filter(c => c.id !== wsEvent.payload.id))
    } else if (wsEvent.type === 'card.moved') {
      const card = wsEvent.payload
      if (card.listId === list.id) {
        setCards(prev => {
          const exists = prev.some(c => c.id === card.id)
          if (exists) {
            return prev.map(c => c.id === card.id ? card : c).sort((a, b) => a.position - b.position)
          } else {
            return [...prev, card].sort((a, b) => a.position - b.position)
          }
        })
      } else {
        setCards(prev => prev.filter(c => c.id !== card.id))
      }
    }
  }, [wsEvent, list.id])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const card = await createCard(list.id, newTitle.trim(), '', newPriority)
      setCards(prev => [...prev, card])
      setNewTitle(''); setAddingCard(false)
    } catch { }
  }

  async function handleDelete(cardId: string) {
    try { await deleteCard(cardId); setCards(prev => prev.filter(c => c.id !== cardId)) } catch { }
  }

  async function handleRename() {
    if (!renameVal.trim() || renameVal === list.name) { setIsRenaming(false); return }
    try { await updateList(list.id, renameVal.trim()); list.name = renameVal.trim(); setIsRenaming(false) } catch { }
  }

  async function handleDeleteList() {
    if (!window.confirm(`Delete column "${list.name}" and all its cards?`)) return
    try { await deleteList(list.id); onDeleted() } catch { }
  }

  return (
    <>
      <div
        className={`kanban-col ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => {
          setIsDragOver(false)
        }}
        onDrop={async (e) => {
          e.preventDefault()
          setIsDragOver(false)
          try {
            const dataStr = e.dataTransfer.getData('application/json')
            if (!dataStr) return
            const { id: cardId, version, listId: sourceListId } = JSON.parse(dataStr)
            if (sourceListId === list.id) return
            
            const updatedCard = await moveCard(cardId, list.id, version)
            window.dispatchEvent(new CustomEvent('card-moved-local', { detail: { card: updatedCard, sourceListId } }))
          } catch (err) {
            console.error('Failed to move card:', err)
          }
        }}
      >
        <div className="col-header">
          <div className="col-color-dot" style={{ background: color }} />
          {isRenaming ? (
            <input className="col-rename-input" value={renameVal} autoFocus
              onChange={e => setRenameVal(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false) }}
            />
          ) : (
            <h3 onDoubleClick={() => setIsRenaming(true)} title="Double-click to rename">{list.name}</h3>
          )}
          <span className="col-count">{cards.length}</span>
          <div className="col-actions">
            <button className="col-action-btn" onClick={() => setIsRenaming(true)} title="Rename"><Ico.Edit /></button>
            <button className="col-action-btn danger" onClick={handleDeleteList} title="Delete column"><Ico.Trash /></button>
          </div>
        </div>

        <div className="col-cards">
          {loading && <div className="col-loading"><div className="spinner" /></div>}
          {!loading && cards.map(card => (
            <TaskCard key={card.id} card={card} onEdit={() => setEditingCard(card)} onDelete={() => handleDelete(card.id)} />
          ))}
        </div>

        <div className="add-card-form">
          {!addingCard ? (
            <button id={`add-card-${list.id.slice(0, 8)}`} className="add-card-trigger" onClick={() => setAddingCard(true)}>
              <Ico.Plus /> Add a card
            </button>
          ) : (
            <form className="add-card-expanded" onSubmit={handleCreate}>
              <input className="input" placeholder="Card title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
              <div className="add-card-row">
                <PrioritySelect value={newPriority} onChange={setNewPriority} />
                <button className="btn btn-primary btn-sm" type="submit">Add</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddingCard(false)}><Ico.X /></button>
              </div>
            </form>
          )}
        </div>
      </div>

      {editingCard && (
        <CardEditModal
          card={editingCard}
          onSave={updated => { setCards(prev => prev.map(c => c.id === updated.id ? updated : c)); setEditingCard(null) }}
          onClose={() => setEditingCard(null)}
        />
      )}
    </>
  )
}

/* ===== Sidebar ===== */
function Sidebar({ workspaces, boards, activeWorkspaceId, activeBoardId, onSelectWorkspace, onSelectBoard, onNewWorkspace, onNewBoard, collapsed, onToggle }: {
  workspaces: Workspace[]; boards: Board[]; activeWorkspaceId: string; activeBoardId: string;
  onSelectWorkspace: (id: string) => void; onSelectBoard: (id: string) => void;
  onNewWorkspace: () => void; onNewBoard: () => void; collapsed: boolean; onToggle: () => void;
}) {
  const [expandedWs, setExpandedWs] = useState<Set<string>>(new Set([activeWorkspaceId]))

  useEffect(() => {
    setExpandedWs(prev => new Set([...prev, activeWorkspaceId]))
  }, [activeWorkspaceId])

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <div className="sidebar-brand"><Ico.Forge /><span>TaskForge</span></div>}
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <Ico.ChevronRight /> : <Ico.ChevronDown />}
        </button>
      </div>

      {!collapsed && (
        <nav className="sidebar-nav">
          <div className="sidebar-section-header">
            <span>Workspaces</span>
            <button id="new-workspace-btn" className="sidebar-add-btn" onClick={onNewWorkspace} title="New workspace"><Ico.Plus /></button>
          </div>
          {workspaces.length === 0 && (
            <div className="sidebar-empty">No workspaces yet</div>
          )}
          {workspaces.map(ws => {
            const isExpanded = expandedWs.has(ws.id)
            const wsBoards = boards.filter(b => b.workspaceId === ws.id)
            return (
              <div key={ws.id} className={`sidebar-ws ${ws.id === activeWorkspaceId ? 'active' : ''}`}>
                <button className="sidebar-ws-btn" onClick={() => {
                  onSelectWorkspace(ws.id)
                  setExpandedWs(prev => {
                    const n = new Set(prev)
                    if (n.has(ws.id)) n.delete(ws.id); else n.add(ws.id)
                    return n
                  })
                }}>
                  <span className="ws-icon"><Ico.Workspace /></span>
                  <span className="ws-name">{ws.name}</span>
                  {isExpanded ? <Ico.ChevronDown /> : <Ico.ChevronRight />}
                </button>
                {isExpanded && (
                  <div className="sidebar-boards">
                    {wsBoards.map(b => (
                      <button key={b.id} id={`board-${b.id.slice(0, 8)}`} className={`sidebar-board-btn ${b.id === activeBoardId ? 'active' : ''}`} onClick={() => onSelectBoard(b.id)}>
                        <span className="board-dot" />
                        {b.name}
                      </button>
                    ))}
                    <button id={`add-board-${ws.id.slice(0, 8)}`} className="sidebar-new-board" onClick={onNewBoard}>
                      <Ico.Plus /><span>New board</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      )}
    </aside>
  )
}

/* ===== Activity Item ===== */
function ActivityItem({ activity }: { activity: any }) {
  const getActionText = () => {
    const actor = <strong>{activity.actorName}</strong>
    const title = activity.metadata?.title || 'a card'
    
    switch (activity.action) {
      case 'card.created':
        return <>{actor} created card <strong>"{title}"</strong></>
      case 'card.updated':
        return <>{actor} updated card <strong>"{title}"</strong></>
      case 'card.deleted':
        return <>{actor} deleted card</>
      case 'card.moved':
        return <>{actor} moved card <strong>"{title}"</strong></>
      default:
        return <>{actor} performed {activity.action} on {activity.entityType}</>
    }
  }

  const getActionClass = () => {
    if (activity.action.includes('created')) return 'created'
    if (activity.action.includes('updated')) return 'updated'
    if (activity.action.includes('moved')) return 'moved'
    if (activity.action.includes('deleted')) return 'deleted'
    return ''
  }

  const getActionEmoji = () => {
    if (activity.action.includes('created')) return '➕'
    if (activity.action.includes('updated')) return '📝'
    if (activity.action.includes('moved')) return '📦'
    if (activity.action.includes('deleted')) return '🗑️'
    return '🔔'
  }

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr)
    const diffMs = Date.now() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="activity-item">
      <div className={`activity-icon ${getActionClass()}`}>
        {getActionEmoji()}
      </div>
      <div className="activity-info">
        <div className="activity-action">{getActionText()}</div>
        <div className="activity-time">{timeAgo(activity.createdAt)}</div>
      </div>
    </div>
  )
}

/* ===== Dashboard ===== */
function Dashboard({ onLogout, theme, toggleTheme }: { onLogout: () => void; theme: string; toggleTheme: () => void }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [lists, setLists] = useState<BoardList[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('')
  const [activeBoardId, setActiveBoardId] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Card[] | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [wsEvent, setWsEvent] = useState<any>(null)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [showCreateList, setShowCreateList] = useState(false)
  const [loadingLists, setLoadingLists] = useState(false)
  const searchTimeoutRef = useRef<any>(null)

  // Activity feed states
  const [showActivity, setShowActivity] = useState(false)
  const [hasNewActivity, setHasNewActivity] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)

  // Card count tracking state for statistics toolbar
  const [boardCards, setBoardCards] = useState<Record<string, Card[]>>({})

  // Load workspaces + their boards on mount
  useEffect(() => {
    async function init() {
      try {
        const ws = await getWorkspaces()
        setWorkspaces(ws)
        if (ws.length > 0) {
          const firstWs = ws[0]!
          setActiveWorkspaceId(firstWs.id)
          const bds = await getBoards(firstWs.id)
          setBoards(bds)
          if (bds.length > 0) {
            setActiveBoardId(bds[0]!.id)
          }
        }
      } catch { }
    }
    init()
  }, [])

  // Load lists and clear card cache when board changes
  useEffect(() => {
    if (!activeBoardId) { setLists([]); setBoardCards({}); return }
    setLoadingLists(true)
    setBoardCards({})
    getLists(activeBoardId).then(l => setLists(l)).catch(() => setLists([])).finally(() => setLoadingLists(false))
  }, [activeBoardId])

  // WebSocket
  useEffect(() => {
    const token = getToken()
    if (!token) return
    let ws: WebSocket; let reconnectTimer: any
    function connect() {
      ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`)
      ws.onopen = () => setWsConnected(true)
      ws.onmessage = (e) => { try { setWsEvent(JSON.parse(e.data) ) } catch { } }
      ws.onclose = () => { setWsConnected(false); reconnectTimer = setTimeout(connect, 5000) }
      ws.onerror = () => ws.close()
    }
    connect()
    return () => { clearTimeout(reconnectTimer); ws?.close() }
  }, [])

  // Listen to WebSocket events to set activity notification dot
  useEffect(() => {
    if (!wsEvent) return
    if (['card.created', 'card.updated', 'card.deleted', 'card.moved'].includes(wsEvent.type)) {
      setHasNewActivity(true)
    }
  }, [wsEvent])

  // Load activities when panel is opened
  useEffect(() => {
    if (showActivity) {
      setLoadingActivity(true)
      getActivity().then(data => {
        setActivities(data)
        setHasNewActivity(false)
      }).catch(err => {
        console.error('Failed to load activity:', err)
      }).finally(() => {
        setLoadingActivity(false)
      })
    }
  }, [showActivity])

  async function handleSelectWorkspace(id: string) {
    setActiveWorkspaceId(id)
    try {
      const bds = await getBoards(id)
      // Merge boards (avoid duplicates from other workspaces)
      setBoards(prev => [...prev.filter(b => b.workspaceId !== id), ...bds])
      if (bds.length > 0) setActiveBoardId(bds[0]!.id)
      else setActiveBoardId('')
    } catch { }
  }

  function handleSelectBoard(id: string) {
    setActiveBoardId(id)
  }

  function handleSearchChange(val: string) {
    setSearchQuery(val)
    clearTimeout(searchTimeoutRef.current)
    if (!val.trim()) { setSearchResults(null); return }
    searchTimeoutRef.current = setTimeout(async () => {
      try { setSearchResults(await searchCards(val.trim())) } catch { setSearchResults([]) }
    }, 400)
  }

  const activeBoard = boards.find(b => b.id === activeBoardId)
  const activeWsBoards = boards.filter(b => b.workspaceId === activeWorkspaceId)

  // Compute card count stats
  const allCards = Object.values(boardCards).flat()
  const totalCardsCount = allCards.length
  const lowCount = allCards.filter(c => c.priority === 'low').length
  const mediumCount = allCards.filter(c => c.priority === 'medium').length
  const highCount = allCards.filter(c => c.priority === 'high').length
  const urgentCount = allCards.filter(c => c.priority === 'urgent').length

  return (
    <div className="app-layout">
      <Sidebar
        workspaces={workspaces}
        boards={boards}
        activeWorkspaceId={activeWorkspaceId}
        activeBoardId={activeBoardId}
        onSelectWorkspace={handleSelectWorkspace}
        onSelectBoard={handleSelectBoard}
        onNewWorkspace={() => setShowCreateWs(true)}
        onNewBoard={() => setShowCreateBoard(true)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(o => !o)}
      />

      <div className="main-content">
        {/* Topbar */}
        <header className="dash-header">
          <div className="dash-header-left">
            {sidebarCollapsed && <div className="dash-logo-mini"><Ico.Forge /></div>}
            <div className="dash-breadcrumb">
              {workspaces.find(w => w.id === activeWorkspaceId)?.name}
              {activeBoard && <><span className="breadcrumb-sep">/</span>{activeBoard.name}</>}
            </div>
            {activeBoard && activeWsBoards.length > 1 && (
              <BoardSelect
                boards={activeWsBoards}
                value={activeBoardId}
                onChange={handleSelectBoard}
              />
            )}
          </div>
          <div className="dash-search">
            <span className="dash-search-icon"><Ico.Search /></span>
            <input id="global-search" className="input" placeholder="Search cards..." value={searchQuery} onChange={e => handleSearchChange(e.target.value)} />
          </div>
          <div className="dash-header-actions">
            <div className="ws-indicator">
              <div className={`ws-dot ${wsConnected ? 'connected' : ''}`} />
              <span>{wsConnected ? 'Live' : 'Offline'}</span>
            </div>
            <button className="theme-toggle activity-btn" onClick={() => setShowActivity(true)} aria-label="View activity log">
              <Ico.Bell />
              {hasNewActivity && <span className="activity-dot" />}
            </button>
            <button className="theme-toggle" id="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Ico.Sun /> : <Ico.Moon />}
            </button>
            <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={() => { apiLogout(); onLogout() }}>
              <Ico.Logout /> Logout
            </button>
          </div>
        </header>

        {/* Search Results Overlay */}
        {searchResults && (
          <>
            <div className="search-results-overlay" onClick={() => { setSearchQuery(''); setSearchResults(null) }} />
            <div className="search-results-panel">
              <div className="search-results-header">
                <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => { setSearchQuery(''); setSearchResults(null) }}><Ico.X /> Close</button>
              </div>
              {searchResults.length === 0 && <div className="search-empty">No cards found for "{searchQuery}"</div>}
              {searchResults.map(card => {
                const prio = PRIORITIES.find(p => p.value === card.priority)
                return (
                  <div key={card.id} className="search-result-card">
                    <div className="search-card-prio" style={{ background: prio?.color }} />
                    <div>
                      <h4>{card.title}</h4>
                      <p>{card.description || 'No description'}</p>
                    </div>
                    <span className={`priority-badge ${card.priority}`}>{card.priority}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Board Area */}
        <div className="kanban-wrapper">
          {!activeBoardId ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Ico.Board /></div>
              <h3>No board selected</h3>
              <p>Create a workspace and board to start organizing your tasks.</p>
              <button id="create-ws-cta" className="btn btn-primary" onClick={() => setShowCreateWs(true)}>
                <Ico.Plus /> Create Workspace
              </button>
            </div>
          ) : (
            <>
              <div className="kanban-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <h2>{activeBoard?.name ?? 'Board'}</h2>
                  {totalCardsCount > 0 && (
                    <div className="card-stats">
                      <span className="card-stat">{totalCardsCount} cards</span>
                      {lowCount > 0 && (
                        <span className="card-stat">
                          <span className="prio-dot" style={{ background: '#4CAF7D' }} /> {lowCount} Low
                        </span>
                      )}
                      {mediumCount > 0 && (
                        <span className="card-stat">
                          <span className="prio-dot" style={{ background: '#E5A54B' }} /> {mediumCount} Med
                        </span>
                      )}
                      {highCount > 0 && (
                        <span className="card-stat">
                          <span className="prio-dot" style={{ background: '#E8735A' }} /> {highCount} High
                        </span>
                      )}
                      {urgentCount > 0 && (
                        <span className="card-stat">
                          <span className="prio-dot" style={{ background: '#DC4F45' }} /> {urgentCount} Urg
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button id="add-column-btn" className="btn btn-primary btn-sm" onClick={() => setShowCreateList(true)}>
                  <Ico.Plus /> Add Column
                </button>
              </div>
              {loadingLists ? (
                <div className="board-loading"><div className="spinner" /></div>
              ) : lists.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Ico.Board /></div>
                  <h3>No columns yet</h3>
                  <p>Add your first column to start organizing cards.</p>
                  <button className="btn btn-primary" onClick={() => setShowCreateList(true)}><Ico.Plus /> Add Column</button>
                </div>
              ) : (
                <div className="kanban-board">
                  {lists.map((list, idx) => (
                    <KanbanColumn
                      key={list.id}
                      list={list}
                      colorIdx={idx}
                      wsEvent={wsEvent}
                      onDeleted={() => setLists(prev => prev.filter(l => l.id !== list.id))}
                      onCardsChange={(columnId, colCards) => {
                        setBoardCards(prev => ({ ...prev, [columnId]: colCards }))
                      }}
                    />
                  ))}
                  <div className="add-col-card" onClick={() => setShowCreateList(true)}>
                    <Ico.Plus /> Add Column
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Activity Panel */}
      {showActivity && (
        <>
          <div className="activity-overlay" onClick={() => setShowActivity(false)} />
          <aside className="activity-panel">
            <div className="activity-panel-header">
              <h3><Ico.Bell /> Recent Activity</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowActivity(false)}><Ico.X /> Close</button>
            </div>
            <div className="activity-panel-body">
              {loadingActivity ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                  <div className="spinner" />
                </div>
              ) : activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                  No recent activities.
                </div>
              ) : (
                activities.map(act => (
                  <ActivityItem key={act.id} activity={act} />
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* Modals */}
      {showCreateWs && (
        <CreateWorkspaceModal
          onCreated={ws => { setWorkspaces(prev => [...prev, ws]); setActiveWorkspaceId(ws.id); setShowCreateWs(false) }}
          onClose={() => setShowCreateWs(false)}
        />
      )}
      {showCreateBoard && activeWorkspaceId && (
        <CreateBoardModal
          workspaceId={activeWorkspaceId}
          onCreated={board => { setBoards(prev => [...prev, board]); setActiveBoardId(board.id); setShowCreateBoard(false) }}
          onClose={() => setShowCreateBoard(false)}
        />
      )}
      {showCreateList && activeBoardId && (
        <CreateListModal
          boardId={activeBoardId}
          onCreated={list => { setLists(prev => [...prev, list]); setShowCreateList(false) }}
          onClose={() => setShowCreateList(false)}
        />
      )}
    </div>
  )
}

/* ===== Landing Page ===== */
function LandingPage({ onGetStarted, onLogin, theme, toggleTheme }: { onGetStarted: () => void; onLogin: () => void; theme: string; toggleTheme: () => void }) {
  const marqueeItems = ['Real-time Collaboration','Kanban Boards','WebSocket Events','Full-text Search','CLI Client','JWT Authentication','Activity Logging','PostgreSQL','Dynamic Workspaces','Real-time Collaboration','Kanban Boards','WebSocket Events','Full-text Search','CLI Client','JWT Authentication','Activity Logging','PostgreSQL','Dynamic Workspaces']
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo"><Ico.Forge />TaskForge</div>
        <div className="landing-nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <Ico.Sun /> : <Ico.Moon />}</button>
          <button className="btn btn-ghost" onClick={onLogin}>Log In</button>
          <button className="btn btn-primary" onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><div className="hero-badge-dot" />Open Source Project Management</div>
          <h1><span className="gradient-text">Forge</span> Your<br />Productivity</h1>
          <p>Kanban-style project management with dynamic workspaces, real-time WebSocket sync, full-text search, and a CLI client — all powered by PostgreSQL.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>Start Forging</button>
            <button className="btn btn-secondary btn-lg" onClick={onLogin}>Log In</button>
          </div>
        </div>
        <div className="hero-visual">
          <img src={mascotImg} alt="Forge the Manatee" className="hero-mascot" />
        </div>
      </section>
      <div className="marquee-strip">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (<div className="marquee-item" key={i}><span />{item}</div>))}
        </div>
      </div>
      <section className="features">
        <div className="features-header"><h2>Built for Modern Teams</h2><p>Everything you need to manage projects and ship faster.</p></div>
        <div className="features-grid">
          <div className="feature-card"><div className="feature-icon teal"><Ico.Bolt /></div><h3>Real-time Sync</h3><p>WebSocket-powered updates. See changes instantly — no refresh needed.</p></div>
          <div className="feature-card"><div className="feature-icon coral"><Ico.Board /></div><h3>Dynamic Kanban</h3><p>Create workspaces, boards and columns on the fly. Organize tasks visually.</p></div>
          <div className="feature-card"><div className="feature-icon green"><Ico.Search /></div><h3>Full-text Search</h3><p>PostgreSQL-powered search. Find any task instantly across all your boards.</p></div>
          <div className="feature-card"><div className="feature-icon purple"><Ico.Terminal /></div><h3>CLI Client</h3><p>Manage tasks from the terminal. Create, move and search cards without leaving your workflow.</p></div>
        </div>
      </section>
      <footer className="landing-footer"><p>TaskForge © {new Date().getFullYear()} — Built with Express, React, PostgreSQL & WebSockets</p></footer>
    </div>
  )
}

/* ===== Auth Page ===== */
function AuthPage({ onLogin, onBack, theme, toggleTheme }: { onLogin: () => void; onBack: () => void; theme: string; toggleTheme: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('')
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try { mode === 'register' ? await register(email, password, name) : await login(email, password); onLogin() }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="btn btn-ghost auth-back" onClick={onBack}><Ico.Back /></button>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button className="theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? <Ico.Sun /> : <Ico.Moon />}</button>
        </div>
        <div className="auth-header">
          <div className="auth-logo"><Ico.Forge />TaskForge</div>
          <p>{mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group"><label className="label" htmlFor="auth-name">Name</label>
              <input id="auth-name" className="input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required /></div>
          )}
          <div className="form-group"><label className="label" htmlFor="auth-email">Email</label>
            <input id="auth-email" className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label className="label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          {error && <div className="auth-error">{error}</div>}
          <button id="auth-submit-btn" className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <div className="spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'login' ? (<>Don't have an account? <button onClick={() => { setMode('register'); setError('') }}>Sign up</button></>) : (<>Already have an account? <button onClick={() => { setMode('login'); setError('') }}>Sign in</button></>)}
        </div>
        <div className="auth-demo">
          <p>Demo credentials:</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { setEmail('demo@taskforge.com'); setPassword('password123'); setMode('login') }}>Use demo account</button>
        </div>
      </div>
    </div>
  )
}

/* ===== App Root ===== */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken())
  const [view, setView] = useState<AppView>(loggedIn ? 'dashboard' : 'landing')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(THEME_KEY, theme) }, [theme])

  function toggleTheme() { setTheme(p => p === 'light' ? 'dark' : 'light') }
  function handleLogin() { setLoggedIn(true); setView('dashboard') }
  function handleLogout() { setLoggedIn(false); setView('landing') }

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} onLogin={() => setView('auth')} theme={theme} toggleTheme={toggleTheme} />
  if (view === 'auth' || !loggedIn) return <AuthPage onLogin={handleLogin} onBack={() => setView('landing')} theme={theme} toggleTheme={toggleTheme} />
  return <Dashboard onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
}
