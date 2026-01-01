'use client'

import { useCallback } from 'react'
import Konva from 'konva'
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { StrategyBoardObject } from '@/lib/ffxiv-strategy-board'

import { backgroundOptions, objectLibrary } from '../constants'
import { useStrategyBoard } from '../context'
import { canvasWidth, canvasHeight, positionToCanvasPosition, canvasPositionToPosition } from './calc'

function CanvasObject(props: { object: StrategyBoardObject, index: number, readOnly?: boolean }) {
  const { object, index, readOnly } = props

  const { selectedObjectIndexes, selectObjects, setObjectPosition } = useStrategyBoard()
  
  const objectLibraryItem = objectLibrary.get(object.type)!

  // 点击选中图形
  const handleCanvasObjectClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    event.cancelBubble = true

    const isObjectSelected = selectedObjectIndexes.includes(index)

    if (event.evt.shiftKey || event.evt.ctrlKey) {
      if (isObjectSelected) {
        selectObjects(selectedObjectIndexes.filter(selectedObjectIndex => selectedObjectIndex !== index))
      } else {
        selectObjects([...selectedObjectIndexes, index])
      }
      return
    }

    if (!isObjectSelected) {
      selectObjects([index])
    }
  }, [index, selectObjects, selectedObjectIndexes])

  // 拖动图形位置
  const handleCanvasObjectDragStart = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    selectObjects([index])
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(index, position)
  }, [index, selectObjects, setObjectPosition])
  const handleCanvasObjectDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(index, position)
  }, [index, setObjectPosition])
  const handleCanvasObjectDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(index, position)
  }, [index, setObjectPosition])

  return (
    <Group
      id={String(index)}
      {...positionToCanvasPosition(object.position)}
      offsetX={20}
      offsetY={20}
      width={40}
      height={40}
      draggable={!readOnly}
      onClick={handleCanvasObjectClick}
      onDragStart={handleCanvasObjectDragStart}
      onDragMove={handleCanvasObjectDragMove}
      onDragEnd={handleCanvasObjectDragEnd}
    >
      <Rect
        offsetX={-0.5}
        offsetY={-0.5}
        width={39}
        height={39}
        strokeWidth={1}
        stroke="#ffffff1a"
        cornerRadius={3}
        fill="#171717"
      />
      <Text
        width={40}
        height={40}
        text={objectLibraryItem.icon}
        fontSize={12}
        align="center"
        verticalAlign="middle"
        fill="#a1a1a1"
      />
    </Group>
  )
}

export interface StrategyBoardCanvasProps {
  readOnly?: boolean
}

export function StrategyBoardCanvas(props: StrategyBoardCanvasProps) {
  const { readOnly } = props

  const { scene, selectObjects } = useStrategyBoard()

  const backgroundOption = backgroundOptions.get(scene.background)!

  // 点击空白区域取消选中图形
  const handleStageClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event.evt.shiftKey || event.evt.ctrlKey) return
    selectObjects([])
  }, [selectObjects])

  return (
    <Stage width={canvasWidth} height={canvasHeight} onClick={handleStageClick}>
      <Layer>
        <Rect width={canvasWidth} height={canvasHeight} fill="#171717" />
        <Text
          width={canvasWidth}
          height={canvasHeight}
          text={backgroundOption.image}
          fontSize={200}
          align="center"
          verticalAlign="middle"
          fill="#fafafa0d"
        />
      </Layer>
      <Layer>
        {scene.objects.map((object, index) => (
          <CanvasObject key={index} object={object} index={index} readOnly={readOnly} />
        ))}
      </Layer>
    </Stage>
  )
}
