'use client'

import { Card, CardContent } from '@/components/ui/card'

import { StrategyBoardCanvas } from './canvas'

export function StrategyBoardViewer() {
  return (
    <div className="size-full flex flex-col items-center justify-center">
      <Card>
        <CardContent>
          <StrategyBoardCanvas readOnly />
        </CardContent>
      </Card>
    </div>
  )
}
