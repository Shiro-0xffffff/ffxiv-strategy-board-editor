import { defineRelations } from 'drizzle-orm'

import * as schema from './schema'

export const relations = defineRelations(schema, r => ({
  strategyBoards: {
    owner: r.one.users({
      from: r.strategyBoards.ownerUserId,
      to: r.users.id,
    }),
  },
}))
