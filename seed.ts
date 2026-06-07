import bcrypt from 'bcryptjs'
import { pool } from './src/db/pool.js'

async function runSeed() {
  console.log('🌱 Starting database seeding with rich demo data...')

  try {
    const email = 'demo@taskforge.com'
    const password = 'password123'
    const name = 'Demo User'

    // Fixed UUIDs
    const userId = '00000000-0000-4000-a000-000000000001'

    // Workspaces
    const ws1 = '10000000-0000-4000-a000-000000000001'
    const ws2 = '10000000-0000-4000-a000-000000000002'
    const ws3 = '10000000-0000-4000-a000-000000000003'

    // Boards
    const b1 = '20000000-0000-4000-a000-000000000001'
    const b2 = '20000000-0000-4000-a000-000000000002'
    const b3 = '20000000-0000-4000-a000-000000000003'
    const b4 = '20000000-0000-4000-a000-000000000004'
    const b5 = '20000000-0000-4000-a000-000000000005'

    // Lists
    const l1  = '30000000-0000-4000-a000-000000000001'
    const l2  = '30000000-0000-4000-a000-000000000002'
    const l3  = '30000000-0000-4000-a000-000000000003'
    const l4  = '30000000-0000-4000-a000-000000000004'
    const l5  = '30000000-0000-4000-a000-000000000005'
    const l6  = '30000000-0000-4000-a000-000000000006'
    const l7  = '30000000-0000-4000-a000-000000000007'
    const l8  = '30000000-0000-4000-a000-000000000008'
    const l9  = '30000000-0000-4000-a000-000000000009'
    const l10 = '30000000-0000-4000-a000-000000000010'
    const l11 = '30000000-0000-4000-a000-000000000011'
    const l12 = '30000000-0000-4000-a000-000000000012'
    const l13 = '30000000-0000-4000-a000-000000000013'
    const l14 = '30000000-0000-4000-a000-000000000014'
    const l15 = '30000000-0000-4000-a000-000000000015'

    console.log('🔄 Cleaning up all demo data...')
    await pool.query('DELETE FROM activity_log WHERE actor_id = $1', [userId])
    await pool.query('DELETE FROM card_labels')
    await pool.query('DELETE FROM cards')
    await pool.query('DELETE FROM labels')
    await pool.query('DELETE FROM lists')
    await pool.query('DELETE FROM boards')
    await pool.query('DELETE FROM workspaces')
    await pool.query('DELETE FROM users WHERE email = $1', [email])

    const hashedPassword = bcrypt.hashSync(password, 10)

    // ── User ──
    await pool.query(
      'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4)',
      [userId, email, hashedPassword, name]
    )
    console.log(`✅ Demo user: ${email} / ${password}`)

    // ── Workspaces ──
    await pool.query("INSERT INTO workspaces (id, name, slug) VALUES ($1, 'Personal Projects', 'personal')", [ws1])
    await pool.query("INSERT INTO workspaces (id, name, slug) VALUES ($1, 'Acme Corp', 'acme-corp')", [ws2])
    await pool.query("INSERT INTO workspaces (id, name, slug) VALUES ($1, 'Freelance', 'freelance')", [ws3])
    console.log('✅ 3 Workspaces created')

    // ── Boards ──
    // ws1: Personal
    await pool.query("INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, 'TaskForge Redesign 🦦')", [b1, ws1])
    await pool.query("INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, 'Learning Goals 📚')", [b2, ws1])
    // ws2: Acme Corp
    await pool.query("INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, 'Sprint 14 — Q3')", [b3, ws2])
    await pool.query("INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, 'Marketing Campaign')", [b4, ws2])
    // ws3: Freelance
    await pool.query("INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, 'Client: Manatee Energy')", [b5, ws3])
    console.log('✅ 5 Boards created')

    // ── Lists ──
    // Board 1: TaskForge Redesign
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Backlog 📋', 0)", [l1, b1])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'In Progress ⚙️', 1)", [l2, b1])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Review 🔍', 2)", [l3, b1])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Done ✅', 3)", [l4, b1])

    // Board 2: Learning Goals
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Want to Learn', 0)", [l5, b2])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Currently Studying', 1)", [l6, b2])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Completed', 2)", [l7, b2])

    // Board 3: Sprint 14
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'To Do', 0)", [l8, b3])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'In Development', 1)", [l9, b3])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'QA Testing', 2)", [l10, b3])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Deployed', 3)", [l11, b3])

    // Board 4: Marketing
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Ideas 💡', 0)", [l12, b4])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'In Progress', 1)", [l13, b4])

    // Board 5: Client Manatee
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Design', 0)", [l14, b5])
    await pool.query("INSERT INTO lists (id, board_id, name, position) VALUES ($1, $2, 'Development', 1)", [l15, b5])
    console.log('✅ 15 Lists created across 5 boards')

    // ── Cards ──
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 86400000)
    const nextWeek = new Date(now.getTime() + 7 * 86400000)
    const yesterday = new Date(now.getTime() - 86400000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400000)

    // Board 1: TaskForge Redesign — Backlog
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Add drag-and-drop card reordering', 'Implement HTML5 drag-and-drop to move cards between columns and reorder within columns.', 0, 'high', $2),
       ($1, 'User avatar & profile settings', 'Allow users to upload a profile picture and change their display name.', 1, 'low', NULL),
       ($1, 'Board background customization', 'Let users pick from preset gradient backgrounds or upload a custom image.', 2, 'low', NULL),
       ($1, 'Email notifications for due dates', 'Send email reminders when a card''s due date is approaching (24h before).', 3, 'medium', $3)`,
      [l1, nextWeek, nextWeek]
    )

    // Board 1: TaskForge Redesign — In Progress
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Dynamic sidebar workspace navigation', 'Build collapsible sidebar with workspace/board tree view and active state highlighting.', 0, 'urgent', $2),
       ($1, 'Custom priority dropdown component', 'Replace native <select> with a styled dropdown showing colored dots per priority level.', 1, 'high', $3),
       ($1, 'WebSocket real-time card sync', 'Cards created/updated/deleted by other users should appear instantly without page reload.', 2, 'high', NULL)`,
      [l2, yesterday, tomorrow]
    )

    // Board 1: TaskForge Redesign — Review
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Landing page hero section polish', 'Fine-tune the gradient text, mascot animation, and call-to-action button spacing.', 0, 'medium', $2),
       ($1, 'Dark mode color token adjustments', 'The dark mode teal is too bright — reduce saturation and test contrast ratios.', 1, 'low', NULL)`,
      [l3, twoDaysAgo]
    )

    // Board 1: TaskForge Redesign — Done
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Design system setup (Outfit + Inter)', 'Define CSS custom properties for colors, typography, spacing, and border radius.', 0, 'high', NULL),
       ($1, 'Database schema implementation', 'Create PostgreSQL tables for users, workspaces, boards, lists, cards, labels, and activity_log.', 1, 'urgent', NULL),
       ($1, 'JWT authentication flow', 'Implement /auth/login and /auth/register with bcrypt password hashing and JWT token generation.', 2, 'high', NULL),
       ($1, 'REST API for cards CRUD', 'Build Express routes for create, read, update, delete, move, and search cards.', 3, 'medium', NULL)`,
      [l4]
    )

    // Board 2: Learning Goals — Want to Learn
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
       ($1, 'Rust systems programming', 'Start with The Rust Book, then build a CLI tool.', 0, 'medium'),
       ($1, 'GraphQL API design', 'Learn schema-first approach with Apollo Server and type generation.', 1, 'low'),
       ($1, 'Kubernetes deployment', 'Understand pods, services, and ingress configuration for production apps.', 2, 'high')`,
      [l5]
    )

    // Board 2: Learning Goals — Currently Studying
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Advanced TypeScript patterns', 'Studying generics, conditional types, mapped types, and template literal types.', 0, 'high', $2),
       ($1, 'PostgreSQL performance tuning', 'EXPLAIN ANALYZE, indexing strategies, and query optimization techniques.', 1, 'urgent', $3)`,
      [l6, nextWeek, tomorrow]
    )

    // Board 2: Learning Goals — Completed
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
       ($1, 'React hooks deep dive', 'Covered useState, useEffect, useCallback, useMemo, useRef, and custom hooks.', 0, 'high'),
       ($1, 'Express.js fundamentals', 'Middleware, routing, error handling, and REST API best practices.', 1, 'medium')`,
      [l7]
    )

    // Board 3: Sprint 14 — To Do
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'ACME-142: Fix payment gateway timeout', 'Stripe webhook handler times out on large batch orders. Increase timeout and add retry logic.', 0, 'urgent', $2),
       ($1, 'ACME-143: Add CSV export for reports', 'Users need to export monthly sales reports as downloadable CSV files.', 1, 'high', $3),
       ($1, 'ACME-144: Mobile responsive navbar', 'The navigation bar overflows on screens narrower than 375px.', 2, 'medium', NULL)`,
      [l8, tomorrow, nextWeek]
    )

    // Board 3: Sprint 14 — In Development
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'ACME-139: User role permissions', 'Implement RBAC with admin, manager, and viewer roles. Gate sensitive API endpoints.', 0, 'urgent', $2),
       ($1, 'ACME-140: Dashboard analytics charts', 'Add Chart.js line and bar graphs for monthly revenue and user signup trends.', 1, 'high', $3)`,
      [l9, yesterday, tomorrow]
    )

    // Board 3: Sprint 14 — QA Testing
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
       ($1, 'ACME-137: Search autocomplete', 'Verify debounce behavior and result accuracy across different product categories.', 0, 'medium'),
       ($1, 'ACME-138: Password reset email flow', 'Test the full flow: request reset → receive email → click link → set new password.', 1, 'high')`,
      [l10]
    )

    // Board 3: Sprint 14 — Deployed
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
       ($1, 'ACME-134: Upgrade Node.js to v22', 'Migrated from Node 20 to 22 LTS. All CI pipelines updated.', 0, 'low'),
       ($1, 'ACME-135: Fix memory leak in WebSocket handler', 'Event listeners were not being cleaned up on disconnect. Patched and verified.', 1, 'urgent'),
       ($1, 'ACME-136: Add rate limiting to auth endpoints', 'Implemented express-rate-limit with 5 attempts per minute for login/register.', 2, 'medium')`,
      [l11]
    )

    // Board 4: Marketing — Ideas
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority) VALUES
       ($1, 'Product Hunt launch strategy', 'Draft timeline, prepare assets (logo, screenshots, tagline), and coordinate with beta users for upvotes.', 0, 'high'),
       ($1, 'Blog: "Why We Built TaskForge"', 'Tell the story of our motivation, tech stack decisions, and lessons learned.', 1, 'medium'),
       ($1, 'Twitter/X launch thread', 'Create a 10-tweet thread showcasing features with GIFs and screenshots.', 2, 'low')`,
      [l12]
    )

    // Board 4: Marketing — In Progress
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Create demo video walkthrough', 'Record a 2-minute screen recording showing login → create board → add cards → drag-and-drop.', 0, 'urgent', $2),
       ($1, 'Design social media assets', 'Create OpenGraph images, Twitter cards, and Instagram story templates using Figma.', 1, 'high', $3)`,
      [l13, tomorrow, nextWeek]
    )

    // Board 5: Client Manatee — Design
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Homepage wireframe — desktop', 'Create a high-fidelity wireframe for the homepage based on the approved mood board.', 0, 'high', $2),
       ($1, 'Color palette finalization', 'Client prefers ocean blues and warm sand tones. Prepare 3 palette options.', 1, 'medium', NULL),
       ($1, 'Logo concept v3', 'Third iteration incorporating the manatee silhouette with the energy bolt motif.', 2, 'urgent', $3)`,
      [l14, twoDaysAgo, yesterday]
    )

    // Board 5: Client Manatee — Development
    await pool.query(
      `INSERT INTO cards (list_id, title, description, position, priority, due_date) VALUES
       ($1, 'Next.js project scaffolding', 'Initialize Next.js 15 with App Router, Tailwind CSS, and Vercel deployment config.', 0, 'high', $2),
       ($1, 'CMS integration (Sanity)', 'Set up Sanity Studio for the client to manage blog posts and team member profiles.', 1, 'medium', $3)`,
      [l15, nextWeek, nextWeek]
    )

    console.log('✅ 42 cards populated across all boards')

    // ── Labels ──
    await pool.query("INSERT INTO labels (name, color) VALUES ('Bug', '#DC4F45')")
    await pool.query("INSERT INTO labels (name, color) VALUES ('Feature', '#2D9F93')")
    await pool.query("INSERT INTO labels (name, color) VALUES ('Design', '#7C5CFC')")
    await pool.query("INSERT INTO labels (name, color) VALUES ('Urgent', '#E8735A')")
    await pool.query("INSERT INTO labels (name, color) VALUES ('Documentation', '#E5A54B')")
    console.log('✅ 5 Labels created')

    // ── Activity Log ──
    await pool.query(
      `INSERT INTO activity_log (actor_id, action, entity_type, entity_id, metadata) VALUES
       ($1, 'card.created', 'card', '00000000-0000-0000-0000-000000000000', '{"title":"Database schema implementation"}'),
       ($1, 'card.created', 'card', '00000000-0000-0000-0000-000000000001', '{"title":"JWT authentication flow"}'),
       ($1, 'card.moved',   'card', '00000000-0000-0000-0000-000000000002', '{"title":"Landing page hero section","fromList":"In Progress","toList":"Review"}'),
       ($1, 'card.updated', 'card', '00000000-0000-0000-0000-000000000003', '{"title":"Dark mode color token adjustments","priority":"low"}'),
       ($1, 'card.created', 'card', '00000000-0000-0000-0000-000000000004', '{"title":"Dynamic sidebar workspace navigation"}'),
       ($1, 'card.deleted', 'card', '00000000-0000-0000-0000-000000000005', '{"title":"Old static column layout"}'),
       ($1, 'card.moved',   'card', '00000000-0000-0000-0000-000000000006', '{"title":"Design system setup","fromList":"Review","toList":"Done"}'),
       ($1, 'card.created', 'card', '00000000-0000-0000-0000-000000000007', '{"title":"WebSocket real-time card sync"}'),
       ($1, 'card.updated', 'card', '00000000-0000-0000-0000-000000000008', '{"title":"Custom priority dropdown component","priority":"high"}'),
       ($1, 'card.created', 'card', '00000000-0000-0000-0000-000000000009', '{"title":"ACME-142: Fix payment gateway timeout"}')`,
      [userId]
    )
    console.log('✅ 10 Activity log entries created')

    console.log('\n🌟 Seeding complete!')
    console.log('──────────────────────────────────────────')
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
    console.log('──────────────────────────────────────────')
    console.log('  3 Workspaces • 5 Boards • 15 Lists • 42 Cards')
    console.log('──────────────────────────────────────────')

  } catch (err) {
    console.error('❌ Error seeding database:', err)
  } finally {
    await pool.end()
  }
}

runSeed()
