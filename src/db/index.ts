import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'
export { schema }
import { relations } from './relations'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
export const db = drizzle({
  relations,
  client: pool,
  casing: 'snake_case',
})
