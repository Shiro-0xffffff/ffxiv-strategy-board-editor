'use client'

import { Rect } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardRectangleObject } from '@/lib/ffxiv-strategy-board'

import { sizeToCanvasSize, colorToCanvasColor } from './calc'

export interface RectangleCanvasObjectProps {
  object: StrategyBoardRectangleObject
  selected?: boolean
}

export function RectangleCanvasObject(props: RectangleCanvasObjectProps) {
  const { object, selected } = props
  const { id, size, rotation, transparency, color } = object

  const rectSize = sizeToCanvasSize(size)
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
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Rect
            offsetX={rectSize.width / 2}
            offsetY={rectSize.height / 2}
            width={rectSize.width}
            height={rectSize.height}
            stroke="#fff"
            strokeWidth={2}
            shadowColor="#1A81B3"
            shadowBlur={4}
            rotation={rotation}
          />
        </Portal>
      )}
    </>
  )
}
