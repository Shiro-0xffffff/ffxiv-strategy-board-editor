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

  const rectSize = sizeToCanvasSize({ width, height })
  const rectColor = colorToCanvasColor(color)

  return (
    <>
      <Rect
        offsetX={rectSize.width / 2}
        offsetY={rectSize.height / 2}
        width={rectSize.width}
        height={rectSize.height}
        fill={rectColor}
        opacity={1 - transparency / 100}
        rotation={rotation}
      />
    </>
  )
}
