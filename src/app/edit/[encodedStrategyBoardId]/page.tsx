import { Metadata } from 'next'
import { decodeUUID } from '@/lib/utils'

import { EditPageContent } from './components'
import { getStrategyBoard } from './actions'

export const metadata: Metadata = {
  title: null,
}

export default async function EditPage({ params }: { params: Promise<{ encodedStrategyBoardId: string }> }) {
  const { encodedStrategyBoardId } = await params

  const strategyBoardId = decodeUUID(encodedStrategyBoardId)
  const strategyBoard = await getStrategyBoard(strategyBoardId)
  if (!strategyBoard) return null

  return (
    <EditPageContent strategyBoard={strategyBoard} />
  )
}
