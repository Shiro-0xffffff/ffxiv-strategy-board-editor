'use client'

import { Group, Arc } from 'react-konva'
import { StrategyBoardConeObject } from '@/lib/ffxiv-strategy-board'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

export interface ConeCanvasObjectProps {
  object: StrategyBoardConeObject
  readOnly?: boolean
}

export function ConeCanvasObject(props: ConeCanvasObjectProps) {
  const { object } = props
  const { type, size, flipped, rotation, transparency, arcAngle } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const canvasRadius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)
  const arcEndPointOffsetX = Math.sin(arcAngle * Math.PI / 180) * canvasRadius
  const arcEndPointOffsetY = -Math.cos(arcAngle * Math.PI / 180) * canvasRadius
  const canvasOffsetX = arcAngle < 90 ? arcEndPointOffsetX / 2 : arcAngle < 180 ? canvasRadius / 2 : arcAngle < 270 ? (arcEndPointOffsetX + canvasRadius) / 2 : 0
  const canvasOffsetY = arcAngle < 90 ? -canvasRadius / 2 : arcAngle < 180 ? (arcEndPointOffsetY - canvasRadius) / 2 : 0

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
          innerRadius={0}
          outerRadius={canvasRadius * 0.96}
          angle={arcAngle}
          fill="#ffa13140"
          opacity={1 - transparency / 100}
          rotation={-90}
        />
      </Group>
    </>
  )
}
