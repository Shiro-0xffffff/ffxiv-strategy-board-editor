'use server'

import { InferSelectModel } from 'drizzle-orm'
import { db, schema } from '@/db'

export async function getStrategyBoard(id: string): Promise<(InferSelectModel<typeof schema.strategyBoards> & { scenes: InferSelectModel<typeof schema.scenes>[] }) | null> {
  const strategyBoard = await db.query.strategyBoards.findFirst({
    where: { id },
    with: {
      scenes: true,
    },
  })
  return strategyBoard ?? null
}
