'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import { StrategyBoardCanvas } from './canvas'

export function StrategyBoardViewer() {
  return (
    <div>
      <Card className="mx-auto max-w-fit">
        <CardContent>
          <ScrollArea className="">
            <StrategyBoardCanvas preview />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
