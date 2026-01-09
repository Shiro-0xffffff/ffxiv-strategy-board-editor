'use client'

import { Group, Arc, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardArcObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

export interface ArcCanvasObjectProps {
  object: StrategyBoardArcObject
  selected?: boolean
}

export function ArcCanvasObject(props: ArcCanvasObjectProps) {
  const { object, selected } = props
  const { id, type, size, flipped, rotation, transparency, arcAngle, innerRadius } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const radius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)
  const boundingRadius = radius * 256 / 265
  const holeRadius = radius * innerRadius / 256
  const arcAngleInRad = arcAngle * Math.PI / 180
  const arcOuterEndPointOffsetX = Math.sin(arcAngle * Math.PI / 180) * radius
  const arcOuterEndPointOffsetY = -Math.cos(arcAngle * Math.PI / 180) * radius
  const arcInnerEndPointOffsetY = -Math.cos(arcAngle * Math.PI / 180) * holeRadius
  const shapeOffsetX = arcAngle < 90 ? arcOuterEndPointOffsetX / 2 : arcAngle < 180 ? radius / 2 : arcAngle < 270 ? (arcOuterEndPointOffsetX + radius) / 2 : 0
  const shapeOffsetY = arcAngle < 90 ? (arcInnerEndPointOffsetY - radius) / 2 : arcAngle < 180 ? (arcOuterEndPointOffsetY - radius) / 2 : 0

  return (
    <>
      <Group
        offsetX={shapeOffsetX}
        offsetY={shapeOffsetY}
        clipFunc={ctx => {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, boundingRadius, -Math.PI / 2, -Math.PI / 2 + arcAngleInRad)
          ctx.arc(0, 0, holeRadius, -Math.PI / 2 + arcAngleInRad, -Math.PI / 2, true)
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
            <Arc
              innerRadius={holeRadius}
              outerRadius={boundingRadius}
              angle={arcAngle}
              stroke="#fff"
              strokeWidth={2}
              shadowBlur={4}
              rotation={-90}
            />
          </Group>
        </Portal>
      )}
    </>
  )
}
