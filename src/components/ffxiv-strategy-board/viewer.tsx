'use client'

import { Card, CardContent } from '@/components/ui/card'

import { StrategyBoardCanvasProvider, StrategyBoardCanvas } from './canvas'

export function StrategyBoardViewer() {
  return (
    <Card>
      <CardContent>
        <div className="w-full aspect-4/3">
          <StrategyBoardCanvasProvider>
            <StrategyBoardCanvas preview />
          </StrategyBoardCanvasProvider>
        </div>
      </CardContent>
    </Card>
  )
}
