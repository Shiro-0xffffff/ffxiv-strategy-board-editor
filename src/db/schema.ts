import { pgTable, primaryKey, smallint, integer, bigint, text, char, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { StrategyBoardScene } from '@/lib/ffxiv-strategy-board'

const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
}

export const users = pgTable('users', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity({ startWith: 100000 }),
  nickname: text().notNull(),
  ...timestamps,
})

export const roles = pgTable('roles', {
  id: smallint().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  privilegeLevel: smallint().notNull(),
  ...timestamps,
})

export const userRoles = pgTable('user_roles', {
  userId: bigint({ mode: 'number' }).notNull().references(() => users.id),
  roleId: smallint().notNull().references(() => roles.id),
  ...timestamps,
}, table => [
  primaryKey({ columns: [table.userId, table.roleId] }),
])

export const credentials = pgTable('credentials', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity({ startWith: 100000 }),
  userId: bigint({ mode: 'number' }).notNull().references(() => users.id),
  username: varchar({ length: 50 }).unique().notNull(),
  passwordHash: char({ length: 60 }).notNull(),
  ...timestamps,
})

export const strategyBoards = pgTable('strategy_boards', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity({ startWith: 1000000000 }),
  name: text().notNull(),
  ownerUserId: bigint({ mode: 'number' }).references(() => users.id),
  ...timestamps,
})

export const scenes = pgTable('scenes', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity({ startWith: 1000000000 }),
  strategyBoardId: integer().notNull().references(() => strategyBoards.id),
  name: text().notNull(),
  content: jsonb().notNull().$type<StrategyBoardScene>(),
  ...timestamps,
})
