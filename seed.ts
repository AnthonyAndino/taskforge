import bcrypt from 'bcryptjs'
import { pool } from './src/db/pool.js'

async function runSeed() {
  console.log('🌱 Starting database seeding with fixed UUIDs...')

  try {
    const email = 'demo@taskforge.com'
    const password = 'password123'
    const name = 'Demo User'

    // Fixed UUIDs
    const userId = '00000000-0000-4000-a000-000000000001'
    const workspaceId = '00000000-0000-4000-a000-000000000002'
    const boardId = '00000000-0000-4000-a000-000000000003'
    const listTodoId = '00000000-0000-4000-a000-000000000004'
    const listProgressId = '00000000-0000-4000-a000-000000000005'
    const listDoneId = '00000000-0000-4000-a000-000000000006'

    console.log('🔄 Cleaning up existing demo data...')
    // Cascade cleanup for these specific IDs or workspaces/boards with these names
    await pool.query('DELETE FROM cards WHERE list_id IN ($1, $2, $3)', [listTodoId, listProgressId, listDoneId])
    await pool.query('DELETE FROM lists WHERE id IN ($1, $2, $3) OR name IN (\'To Do 🦦\', \'In Progress ⚙️\', \'Done 🎉\')', [listTodoId, listProgressId, listDoneId])
    await pool.query('DELETE FROM boards WHERE id = $1 OR name = \'TaskForge Redesign 🦦\'', [boardId])
    await pool.query('DELETE FROM workspaces WHERE id = $1 OR slug = \'personal\' OR name = \'Personal Workspace\'', [workspaceId])
    await pool.query('DELETE FROM users WHERE id = $1 OR email = $2', [userId, email])

    const hashedPassword = bcrypt.hashSync(password, 10)
    
    // 1. Create User
    await pool.query(
      'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4)',
      [userId, email, hashedPassword, name]
    )
    console.log(`✅ Demo user created: ${email} / ${password}`)

    // 2. Create Workspace
    await pool.query(
      "INSERT INTO workspaces (id, name, slug) VALUES ($1, 'Personal Workspace', 'personal')",
      [workspaceId]
    )
    console.log('✅ Workspace created: Personal Workspace')

    // 3. Create Board
    await pool.query(
      "INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, 'TaskForge Redesign 🦦')",
      [boardId, workspaceId]
    )
    console.log('✅ Board created: TaskForge Redesign')

    // 4. Create lists
    await pool.query(
      "INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'To Do 🦦', 0)",
      [listTodoId, boardId]
    )
    await pool.query(
      "INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'In Progress ⚙️', 1)",
      [listProgressId, boardId]
    )
    await pool.query(
      "INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Done 🎉', 2)",
      [listDoneId, boardId]
    )
    console.log('✅ Three columns (lists) created successfully.')

    // 5. Populate Tasks (Cards)
    // List 1: To Do
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
      ($1, 'Configure WebSocket endpoints', 'Connect the frontend pulse indicator to /ws and verify heartbeat works properly.', 0, 'medium'),
      ($1, 'Refine CSS animation performance', 'Add hardware acceleration to keyframe transitions on card hover for buttery-smooth movements.', 1, 'low')`,
      [listTodoId]
    )

    // List 2: In Progress
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
      ($1, 'Integrate Forge the Manatee mascot', 'Add the generated illustration assets into the landing page design components and header graphics.', 0, 'high'),
      ($1, 'Test Kanban board multi-column save', 'Double check localStorage loading logic when a column is created or deleted to prevent out-of-sync states.', 1, 'urgent')`,
      [listProgressId]
    )

    // List 3: Done
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
      ($1, 'Establish main design system token set', 'Setup Outfit + Inter google fonts, define cream color variables and responsive utility classes.', 0, 'high'),
      ($1, 'Implement database schema structure', 'Run PostgreSQL initial scripts to generate tables for cards, lists, and users.', 1, 'medium')`,
      [listDoneId]
    )

    console.log('✅ Sample cards populated successfully.')
    console.log('\n🌟 Seeding complete!')
    console.log('--------------------------------------------------')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${password}`)
    console.log('--------------------------------------------------')

  } catch (err) {
    console.error('❌ Error seeding database:', err)
  } finally {
    await pool.end()
  }
}

runSeed()
