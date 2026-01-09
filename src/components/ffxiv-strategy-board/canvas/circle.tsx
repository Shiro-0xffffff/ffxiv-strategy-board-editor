'use client'

import { Group, Circle, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardCircleObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

export interface CircleCanvasObjectProps {
  object: StrategyBoardCircleObject
  selected?: boolean
}

export function CircleCanvasObject(props: CircleCanvasObjectProps) {
  const { object, selected } = props
  const { id, type, size, rotation, transparency } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const radius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)
  const boundingRadius = radius * 256 / 265

  return (
    <>
      <Group
        clipFunc={ctx => {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, boundingRadius, 0, Math.PI * 2)
        }}
        opacity={1 - transparency / 100}
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
          <Circle
            radius={boundingRadius}
            stroke="#fff"
            strokeWidth={2}
            shadowBlur={4}
            rotation={rotation}
          />
        </Portal>
      )}
    </>
  )
}
