'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import Konva from 'konva'
import { Group, Rect, Text } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardTextObject } from '@/lib/ffxiv-strategy-board'

import { useStrategyBoardCanvas } from './context'

const horizontalPadding = 8
const baseHeight = 320
const baseFontSize = 160

export interface TextCanvasObjectProps {
  object: StrategyBoardTextObject
}

export function TextCanvasObject(props: TextCanvasObjectProps) {
  const { object } = props
  const { id, text, color } = object

  const { zoomRatio, isObjectSelected } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const textRef = useRef<Konva.Text>(null)

  const [textCanvasWidth, setTextCanvasWidth] = useState<number>(0)
  useLayoutEffect(() => {
    const textSize = textRef.current?.measureSize(text)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (textSize) setTextCanvasWidth(textSize.width)
  }, [text])

  const textContainerCanvasSize = {
    width: textCanvasWidth + horizontalPadding * 2,
    height: baseHeight * zoomRatio
  }
  const canvasFontSize = baseFontSize * zoomRatio

  return (
    <>
      <Group>
        {/* 多绘制几遍阴影确保描边效果 */}
        {[4, 3, 3, 2].map((shadowBlur, index) => (
          <Text
            key={index}
            ref={textRef}
            offsetX={textContainerCanvasSize.width / 2}
            offsetY={textContainerCanvasSize.height / 2}
            width={textContainerCanvasSize.width}
            height={textContainerCanvasSize.height}
            text={text}
            fontFamily="Noto Sans"
            fontStyle="300"
            fontSize={canvasFontSize}
            align="center"
            verticalAlign="middle"
            shadowColor="#000"
            shadowBlur={shadowBlur}
            fill={color}
          />
        ))}
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Rect
            offsetX={textContainerCanvasSize.width / 2}
            offsetY={textContainerCanvasSize.height / 2}
            width={textContainerCanvasSize.width}
            height={textContainerCanvasSize.height}
            stroke="#fff"
            strokeWidth={2}
            shadowBlur={4}
            listening={false}
          />
        </Portal>
      )}
    </>
  )
}
