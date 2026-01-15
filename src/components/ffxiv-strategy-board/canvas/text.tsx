'use client'

import { Group, Text } from 'react-konva'
import { StrategyBoardTextObject } from '@/lib/ffxiv-strategy-board'

import { objectLibrary } from '../constants'
import { useStrategyBoardCanvas } from './context'

export interface TextCanvasObjectProps {
  object: StrategyBoardTextObject
}

export function TextCanvasObject(props: TextCanvasObjectProps) {
  const { object } = props
  const { id, type, text, color } = object

  const { zoomRatio, isObjectSelected } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const objectLibraryItem = objectLibrary.get(type)!

  const textContainerSize = {
    width: 4000 * zoomRatio,
    height: objectLibraryItem.baseSize * zoomRatio
  }

  const fontSize = 160 * zoomRatio

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
            fontSize={fontSize}
            align="center"
            verticalAlign="middle"
            shadowColor="#000"
            shadowBlur={shadowBlur}
            fill={color}
          />
        ))}
      </Group>
    </>
  )
}
