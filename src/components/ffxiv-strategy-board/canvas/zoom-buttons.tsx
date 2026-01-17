'use client'

import { MouseEventHandler, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Plus, Minus } from 'lucide-react'

import { useStrategyBoardCanvas } from './context'

export function StrategyBoardCanvasZoomButtons() {
  const { isZoomInAvailable, zoomIn, isZoomOutAvailable, zoomOut } = useStrategyBoardCanvas()

  const handleZoomOutButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    zoomOut()
  }, [zoomOut])
  const handleZoomInButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    zoomIn()
  }, [zoomIn])

  return (
    <div className="flex w-fit rounded-lg bg-card">
      <ButtonGroup>
        <Button className="cursor-pointer" variant="outline" size="icon" disabled={!isZoomOutAvailable} onClick={handleZoomOutButtonClick}>
          <Minus />
        </Button>
        <Button className="cursor-pointer" variant="outline" size="icon" disabled={!isZoomInAvailable} onClick={handleZoomInButtonClick}>
          <Plus />
        </Button>
      </ButtonGroup>
    </div>
  )
}
