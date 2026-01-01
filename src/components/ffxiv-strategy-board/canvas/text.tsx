'use client'

import { Text } from 'react-konva'
import { StrategyBoardTextObject } from '@/lib/ffxiv-strategy-board'

import { objectLibrary } from '../constants'
import { canvasWidth, lengthToCanvasLength, sizeToCanvasSize, colorToCanvasColor } from './calc'

export interface TextCanvasObjectProps {
  object: StrategyBoardTextObject
  readOnly?: boolean
}

export function TextCanvasObject(props: TextCanvasObjectProps) {
  const { object } = props
  const { type, content, color } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const canvasSize = {
    ...sizeToCanvasSize({ width: 0, height: objectLibraryItem.baseSize }),
    width: canvasWidth,
  }
  const canvasFontSize = lengthToCanvasLength(160)
  const canvasColor = colorToCanvasColor(color)

  return (
    <>
      <Text
        offsetX={canvasSize.width / 2}
        offsetY={canvasSize.height / 2}
        width={canvasSize.width}
        height={canvasSize.height}
        text={content}
        fontSize={canvasFontSize}
        align="center"
        verticalAlign="middle"
        strokeWidth={0.5}
        stroke="#000"
        shadowColor="#000"
        shadowBlur={2}
        fill={canvasColor}
      />
    </>
  )
}
