'use client'

import { Group, Image } from 'react-konva'
import useImage from 'use-image'
import { StrategyBoardCommonObject, StrategyBoardMechanicLineStackObject, StrategyBoardMechanicLinearKnockbackObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { sizeToCanvasSize } from './calc'

export interface ImageCanvasObjectProps {
  object: StrategyBoardCommonObject | StrategyBoardMechanicLineStackObject | StrategyBoardMechanicLinearKnockbackObject
  readOnly?: boolean
}

export function ImageCanvasObject(props: ImageCanvasObjectProps) {
  const { object } = props
  const { type, size, flipped, rotation, transparency } = object
  
  const objectLibraryItem = objectLibrary.get(type)!

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const imageSize = sizeToCanvasSize({
    width: objectLibraryItem.baseSize * size / 100,
    height: objectLibraryItem.baseSize * size / 100,
  })

  return (
    <>
      <Group
        opacity={1 - transparency / 100}
        scaleX={flipped ? -1 : 1}
        rotation={rotation}
      >
        <Image
          offsetX={imageSize.width / 2}
          offsetY={imageSize.height / 2}
          width={imageSize.width}
          height={imageSize.height}
          image={backgroundImage}
          alt={objectLibraryItem.abbr}
        />
      </Group>
    </>
  )
}
