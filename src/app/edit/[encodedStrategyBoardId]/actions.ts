'use server'

import { revalidatePath } from 'next/cache'
import { InferSelectModel, eq } from 'drizzle-orm'
import { db, schema } from '@/db'
import { StrategyBoardScene } from '@/lib/ffxiv-strategy-board'
import { encodeUUID } from '@/lib/utils'

export async function getStrategyBoard(id: string): Promise<(InferSelectModel<typeof schema.strategyBoards> & { scenes: InferSelectModel<typeof schema.scenes>[] }) | null> {
  const strategyBoard = await db.query.strategyBoards.findFirst({
    where: { id },
    with: {
      scenes: true,
    },
  })
  return strategyBoard ?? null
}

export async function updateSceneContent(id: string, sceneContent: StrategyBoardScene): Promise<void> {
  await db.update(schema.scenes).set({ content: sceneContent }).where(eq(schema.scenes.id, id))
  const encodedStrategyBoardId = encodeUUID(id)
  revalidatePath(`/edit/${encodedStrategyBoardId}`)
}
