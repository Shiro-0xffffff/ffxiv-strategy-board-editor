'use client'

import { Rect } from 'react-konva'
import { StrategyBoardLineObject } from '@/lib/ffxiv-strategy-board'

import { lengthToCanvasLength, colorToCanvasColor } from './calc'

export interface LineCanvasObjectProps {
  object: StrategyBoardLineObject
  readOnly?: boolean
}

export function LineCanvasObject(props: LineCanvasObjectProps) {
  const { object } = props
  const { length, lineWidth, rotation, transparency, color } = object

  const rectSize = {
    width: lengthToCanvasLength(length),
    height: lengthToCanvasLength(lineWidth),
  }
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
