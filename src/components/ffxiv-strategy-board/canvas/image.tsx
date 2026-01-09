'use client'

import { Group, Rect, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardCommonObject, StrategyBoardMechanicLineStackObject, StrategyBoardMechanicLinearKnockbackObject, StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { sizeToCanvasSize } from './calc'

export interface ImageCanvasObjectProps {
  object: StrategyBoardCommonObject | StrategyBoardMechanicLineStackObject | StrategyBoardMechanicLinearKnockbackObject
  selected?: boolean
}

export function ImageCanvasObject(props: ImageCanvasObjectProps) {
  const { object, selected } = props
  const { id, type, size, flipped, rotation, transparency } = object

  const repeat: { x: number, y: number } | null = (object => {
    if (object.type === StrategyBoardObjectType.MechanicLineStack) {
      return { x: 1, y: object.displayCount }
    }
    if (object.type === StrategyBoardObjectType.MechanicLinearKnockback) {
      return { x: object.displayCount.horizontal, y: object.displayCount.vertical }
    }
    return null
  })(object)
  
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
        {repeat ? (
          <Rect
            offsetX={imageSize.width * repeat.x / 2}
            offsetY={imageSize.height * repeat.y / 2}
            width={imageSize.width * repeat.x}
            height={imageSize.height * repeat.y}
            fillPatternImage={backgroundImage}
            fillPatternScaleX={backgroundImage?.width ? imageSize.width / backgroundImage.width : 1}
            fillPatternScaleY={backgroundImage?.height ? imageSize.height / backgroundImage.height : 1}
          />
        ) : (
          <Image
            offsetX={imageSize.width / 2}
            offsetY={imageSize.height / 2}
            width={imageSize.width}
            height={imageSize.height}
            image={backgroundImage}
            alt={objectLibraryItem.abbr}
          />
        )}
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Rect
            offsetX={imageSize.width * (repeat ? repeat.x : 1) / 2}
            offsetY={imageSize.height * (repeat ? repeat.y : 1) / 2}
            width={imageSize.width * (repeat ? repeat.x : 1)}
            height={imageSize.height * (repeat ? repeat.y : 1)}
            stroke="#fff"
            strokeWidth={2}
            cornerRadius={4}
            shadowBlur={4}
            scaleX={flipped ? -1 : 1}
            rotation={rotation}
          />
        </Portal>
      )}
    </>
  )
}
