'use client'

import { Group, Rect, Text } from 'react-konva'
import { StrategyBoardCommonObject, StrategyBoardMechanicLineStackObject, StrategyBoardMechanicLinearKnockbackObject } from '@/lib/ffxiv-strategy-board'

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

  const canvasSize = sizeToCanvasSize({
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
        <Rect
          offsetX={(canvasSize.width - 1) / 2}
          offsetY={(canvasSize.height - 1) / 2}
          width={canvasSize.width - 1}
          height={canvasSize.height - 1}
          strokeWidth={1}
          stroke="#ffffff1a"
          cornerRadius={3}
          fill="#171717d9"
        />
        <Text
          offsetX={canvasSize.width / 2}
          offsetY={canvasSize.height / 2}
          width={canvasSize.width}
          height={canvasSize.height}
          text={objectLibraryItem.icon}
          fontSize={12}
          align="center"
          verticalAlign="middle"
          fill="#a1a1a1"
        />
      </Group>
    </>
  )
}
