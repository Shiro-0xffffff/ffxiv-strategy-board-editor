import { sql } from 'drizzle-orm'
import { pgTable, primaryKey, uuid, smallint, bigint, text, char, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { StrategyBoardScene } from '@/lib/ffxiv-strategy-board'

const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
}

export const users = pgTable('users', {
  id: uuid().primaryKey().default(sql`uuid_generate_v7()`),
  nickname: text().notNull(),
  ...timestamps,
})

export const roles = pgTable('roles', {
  id: smallint().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  privilegeLevel: smallint().notNull(),
  ...timestamps,
})

export const userRoles = pgTable('user_roles', {
  userId: uuid().notNull().references(() => users.id),
  roleId: smallint().notNull().references(() => roles.id),
  ...timestamps,
}, table => [
  primaryKey({ columns: [table.userId, table.roleId] }),
])

export const credentials = pgTable('credentials', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity({ startWith: 100000 }),
  userId: uuid().notNull().references(() => users.id),
  username: varchar({ length: 50 }).unique().notNull(),
  passwordHash: char({ length: 60 }).notNull(),
  ...timestamps,
})

export const strategyBoards = pgTable('strategy_boards', {
  id: uuid().primaryKey().default(sql`uuid_generate_v7()`),
  name: text().notNull(),
  ownerUserId: uuid().references(() => users.id),
  ...timestamps,
})

export const scenes = pgTable('scenes', {
  id: uuid().primaryKey().default(sql`uuid_generate_v7()`),
  strategyBoardId: uuid().notNull().references(() => strategyBoards.id),
  name: text().notNull(),
  content: jsonb().notNull().$type<StrategyBoardScene>(),
  ...timestamps,
})
