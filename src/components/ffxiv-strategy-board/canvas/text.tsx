'use client'

import { Group, Text } from 'react-konva'
import { StrategyBoardTextObject } from '@/lib/ffxiv-strategy-board'

import { objectLibrary } from '../constants'
import { canvasWidth, lengthToCanvasLength, sizeToCanvasSize, colorToCanvasColor } from './calc'

export interface TextCanvasObjectProps {
  object: StrategyBoardTextObject
  readOnly?: boolean
}

export function TextCanvasObject(props: TextCanvasObjectProps) {
  const { object } = props
  const { type, text, color } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const textContainerSize = {
    ...sizeToCanvasSize({ width: 0, height: objectLibraryItem.baseSize }),
    width: canvasWidth,
  }
  const canvasFontSize = lengthToCanvasLength(160)
  const canvasColor = colorToCanvasColor(color)

  return (
    <>
      <Group>
        {/* 多绘制几遍阴影确保描边效果 */}
        {[4, 3, 3, 2].map((shadowBlur, index) => (
          <Text
            key={index}
            offsetX={textContainerSize.width / 2}
            offsetY={textContainerSize.height / 2}
            width={textContainerSize.width}
            height={textContainerSize.height}
            text={text}
            fontSize={canvasFontSize}
            align="center"
            verticalAlign="middle"
            shadowColor="#000"
            shadowBlur={shadowBlur}
            fill={canvasColor}
          />
        ))}
      </Group>
    </>
  )
}
