'use client'

import { Group, Image } from 'react-konva'
import useImage from 'use-image'
import { StrategyBoardConeObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

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

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const radius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)
  const arcAngleInRad = arcAngle * Math.PI / 180
  const arcEndPointOffsetX = Math.sin(arcAngleInRad) * radius
  const arcEndPointOffsetY = -Math.cos(arcAngleInRad) * radius
  const shapeOffsetX = arcAngle < 90 ? arcEndPointOffsetX / 2 : arcAngle < 180 ? radius / 2 : arcAngle < 270 ? (arcEndPointOffsetX + radius) / 2 : 0
  const shapeOffsetY = arcAngle < 90 ? -radius / 2 : arcAngle < 180 ? (arcEndPointOffsetY - radius) / 2 : 0

  return (
    <>
      <Group
        offsetX={shapeOffsetX}
        offsetY={shapeOffsetY}
        clipFunc={ctx => {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + arcAngleInRad)
        }}
        opacity={1 - transparency / 100}
        scaleX={flipped ? -1 : 1}
        rotation={rotation}
      >
        <Image
          offsetX={radius}
          offsetY={radius}
          width={radius * 2}
          height={radius * 2}
          image={backgroundImage}
          alt={objectLibraryItem.abbr}
        />
      </Group>
    </>
  )
}
