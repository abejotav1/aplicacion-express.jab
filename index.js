import { Hono } from 'hono'
import { Database } from 'bun:sqlite'

const app = new Hono()
const db = new Database('./base.sqlite3')

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

app.get('/', (c) => {
  return c.json({ status: 'ok' })
})

app.post('/agrega_todo', async (c) => {
  try {
    const body = await c.req.json()
    const { todo } = body

    if (!todo || todo.trim() === '') {
      return c.json(
        { status: 'error', message: 'El campo "todo" es obligatorio' },
        400
      )
    }

    const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
    const result = stmt.run(todo)

    return c.json(
      {
        status: 'ok',
        message: 'Todo guardado correctamente',
        id: Number(result.lastInsertRowid),
        todo
      },
      201
    )
  } catch (error) {
    return c.json(
      { status: 'error', message: 'Error al procesar la solicitud' },
      500
    )
  }
})

app.get('/todos', (c) => {
  try {
    const todos = db.query('SELECT * FROM todos ORDER BY id DESC').all()
    return c.json(todos)
  } catch (error) {
    return c.json(
      { status: 'error', message: 'Error al obtener las tareas' },
      500
    )
  }
})

export default app
