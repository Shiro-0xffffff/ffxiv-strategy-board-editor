'use server'

import { InferInsertModel } from 'drizzle-orm'
import { db, schema } from '@/db'
import { StrategyBoardBackground, shareCodeToScene } from '@/lib/ffxiv-strategy-board'

export async function importStrategyBoard(shareCode: string): Promise<string> {
  const sceneContent = await shareCodeToScene(shareCode)
  const strategyBoard: InferInsertModel<typeof schema.strategyBoards> = {
    name: sceneContent.name,
  }
  const [{ id: strategyBoardId }] = await db.insert(schema.strategyBoards).values(strategyBoard).returning({ id: schema.strategyBoards.id })
  const scene: InferInsertModel<typeof schema.scenes> = {
    strategyBoardId, 
    name: sceneContent.name,
    content: sceneContent,
  }
  await db.insert(schema.scenes).values(scene).returning({ id: schema.scenes.id })
  return strategyBoardId
}

export async function createStrategyBoard(): Promise<string> {
  const strategyBoard: InferInsertModel<typeof schema.strategyBoards> = {
    name: '未命名战术板',
  }
  const [{ id: strategyBoardId }] = await db.insert(schema.strategyBoards).values(strategyBoard).returning({ id: schema.strategyBoards.id })
  const scene: InferInsertModel<typeof schema.scenes> = {
    strategyBoardId, 
    name: '场景1',
    content: { name: '场景1', background: StrategyBoardBackground.None, objects: [] },
  }
  await db.insert(schema.scenes).values(scene).returning({ id: schema.scenes.id })
  return strategyBoardId
}
