'use client'

import { Card, CardContent } from '@/components/ui/card'

import { StrategyBoardCanvasProvider, StrategyBoardCanvasPreview } from './canvas'

export function StrategyBoardViewer() {
  return (
    <Card>
      <CardContent>
        <div className="w-full aspect-4/3">
          <StrategyBoardCanvasProvider>
            <StrategyBoardCanvasPreview />
          </StrategyBoardCanvasProvider>
        </div>
      </CardContent>
    </Card>
  )
}
