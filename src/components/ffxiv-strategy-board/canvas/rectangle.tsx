'use client'

import { Rect } from 'react-konva'
import { StrategyBoardRectangleObject } from '@/lib/ffxiv-strategy-board'

import { sizeToCanvasSize, colorToCanvasColor } from './calc'

export interface RectangleCanvasObjectProps {
  object: StrategyBoardRectangleObject
  readOnly?: boolean
}

export function RectangleCanvasObject(props: RectangleCanvasObjectProps) {
  const { object } = props
  const { width, height, rotation, transparency, color } = object

  const canvasSize = sizeToCanvasSize({ width, height })
  const canvasColor = colorToCanvasColor(color)

  return (
    <>
      <Rect
        offsetX={canvasSize.width / 2}
        offsetY={canvasSize.height / 2}
        width={canvasSize.width}
        height={canvasSize.height}
        fill={canvasColor}
        opacity={1 - transparency / 100}
        rotation={rotation}
      />
    </>
  )
}
