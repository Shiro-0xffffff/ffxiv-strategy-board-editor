'use client'

import { Group, Arc } from 'react-konva'
import { StrategyBoardArcObject } from '@/lib/ffxiv-strategy-board'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

export interface ArcCanvasObjectProps {
  object: StrategyBoardArcObject
  readOnly?: boolean
}

export function ArcCanvasObject(props: ArcCanvasObjectProps) {
  const { object } = props
  const { type, size, flipped, rotation, transparency, arcAngle, innerRadius } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const canvasRadius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)
  const canvasInnerRadius = canvasRadius * innerRadius / 256
  const arcOuterEndPointOffsetX = Math.sin(arcAngle * Math.PI / 180) * canvasRadius
  const arcOuterEndPointOffsetY = -Math.cos(arcAngle * Math.PI / 180) * canvasRadius
  const arcInnerEndPointOffsetY = -Math.cos(arcAngle * Math.PI / 180) * canvasInnerRadius
  const canvasOffsetX = arcAngle < 90 ? arcOuterEndPointOffsetX / 2 : arcAngle < 180 ? canvasRadius / 2 : arcAngle < 270 ? (arcOuterEndPointOffsetX + canvasRadius) / 2 : 0
  const canvasOffsetY = arcAngle < 90 ? (arcInnerEndPointOffsetY - canvasRadius) / 2 : arcAngle < 180 ? (arcOuterEndPointOffsetY - canvasRadius) / 2 : 0

  return (
    <>
      <Group
        offsetX={canvasOffsetX}
        offsetY={canvasOffsetY}
        opacity={1 - transparency / 100}
        scaleX={flipped ? -1 : 1}
        rotation={rotation}
      >
        <Arc
          innerRadius={canvasInnerRadius * 0.96}
          outerRadius={canvasRadius * 0.96}
          angle={arcAngle}
          fill="#ffa131"
          opacity={1 - transparency / 100}
          rotation={-90}
        />
      </Group>
    </>
  )
}
