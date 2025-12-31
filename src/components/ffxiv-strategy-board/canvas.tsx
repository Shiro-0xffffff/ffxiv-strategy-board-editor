'use client'

import { backgroundOptions } from './constants'
import { useStrategyBoard } from './context'

export interface StrategyBoardCanvasProps {
  readOnly?: boolean
}

export function StrategyBoardCanvas(props: StrategyBoardCanvasProps) {
  const { readOnly } = props

  const { scene } = useStrategyBoard()

  const backgroundOption = backgroundOptions.get(scene.background)!

  return (
    <div className="border bg-neutral-500" style={{ width: 1024, height: 768 }}>
      <div className="size-full p-4 flex items-center justify-center">
        <div className="text-[72px] text-neutral-50/5 select-none">{backgroundOption.image}</div>
      </div>
    </div>
  )
}
