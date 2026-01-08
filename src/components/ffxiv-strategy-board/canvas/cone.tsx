'use client'

import { Group, Wedge, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardConeObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

export interface ConeCanvasObjectProps {
  object: StrategyBoardConeObject
  selected?: boolean
}

export function ConeCanvasObject(props: ConeCanvasObjectProps) {
  const { object, selected } = props
  const { id, type, size, flipped, rotation, transparency, arcAngle } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const radius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)
  const boundingRadius = radius * 256 / 265
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
          ctx.arc(0, 0, boundingRadius, -Math.PI / 2, -Math.PI / 2 + arcAngleInRad)
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
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group
            offsetX={shapeOffsetX}
            offsetY={shapeOffsetY}
            scaleX={flipped ? -1 : 1}
            rotation={rotation}
          >
            <Wedge
              radius={boundingRadius}
              angle={arcAngle}
              stroke="#fff"
              strokeWidth={2}
              shadowColor="#1A81B3"
              shadowBlur={4}
              rotation={-90}
            />
          </Group>
        </Portal>
      )}
    </>
  )
}
