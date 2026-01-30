import { Metadata } from 'next'
import { decodeUUID } from '@/lib/utils'

import { ViewPage } from './components'
import { getStrategyBoard } from './actions'

export async function generateMetadata({ params }: { params: Promise<{ encodedStrategyBoardId: string }> }): Promise<Metadata> {
  const { encodedStrategyBoardId } = await params

  const strategyBoardId = decodeUUID(encodedStrategyBoardId)
  const strategyBoard = await getStrategyBoard(strategyBoardId)

  return {
    title: strategyBoard?.name ? `${strategyBoard.name} - FF14 战术板编辑器` : 'FF14 战术板编辑器',
  }
}

export default async function Page({ params }: { params: Promise<{ encodedStrategyBoardId: string }> }) {
  const { encodedStrategyBoardId } = await params
  
  const strategyBoardId = decodeUUID(encodedStrategyBoardId)
  const strategyBoard = await getStrategyBoard(strategyBoardId)
  if (!strategyBoard) return null

  return (
    <ViewPage encodedStrategyBoardId={encodedStrategyBoardId} strategyBoard={strategyBoard} />
  )
}
