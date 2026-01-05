'use client'

import { Group, Image } from 'react-konva'
import useImage from 'use-image'
import { StrategyBoardCircleObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

export interface CircleCanvasObjectProps {
  object: StrategyBoardCircleObject
  readOnly?: boolean
}

export function CircleCanvasObject(props: CircleCanvasObjectProps) {
  const { object } = props
  const { type, size, rotation, transparency } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const radius = lengthToCanvasLength(objectLibraryItem.baseSize / 2 * size / 100)

  return (
    <>
      <Group
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
    </>
  )
}
