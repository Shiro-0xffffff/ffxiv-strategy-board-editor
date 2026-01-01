'use client'

import { Rect } from 'react-konva'
import { StrategyBoardLineObject } from '@/lib/ffxiv-strategy-board'

import { sizeToCanvasSize, colorToCanvasColor } from './calc'

export interface LineCanvasObjectProps {
  object: StrategyBoardLineObject
  readOnly?: boolean
}

export function LineCanvasObject(props: LineCanvasObjectProps) {
  const { object } = props
  const { width, position, endPoint, transparency, color } = object

  const projection = { width: endPoint.x - position.x, height: endPoint.y - position.y }

  const canvasSize = sizeToCanvasSize({ width, height: Math.hypot(projection.width, projection.height) })
  const canvasRotation = -Math.atan2(projection.width, projection.height) * 180 / Math.PI
  const canvasColor = colorToCanvasColor(color)

  return (
    <>
      <Rect
        offsetX={canvasSize.width / 2}
        width={canvasSize.width}
        height={canvasSize.height}
        fill={canvasColor}
        opacity={1 - transparency / 100}
        rotation={canvasRotation}
      />
    </>
  )
}
