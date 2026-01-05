'use client'

import { useCallback } from 'react'
import useImage from 'use-image'
import Konva from 'konva'
import { Stage, Layer, Group, Image } from 'react-konva'
import { StrategyBoardObject, StrategyBoardObjectType, createObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'
import { TextCanvasObject } from './text'
import { LineCanvasObject } from './line'
import { RectangleCanvasObject } from './rectangle'
import { CircleCanvasObject } from './circle'
import { ConeCanvasObject } from './cone'
import { ArcCanvasObject } from './arc'
import { ImageCanvasObject } from './image'
import { canvasWidth, canvasHeight, positionToCanvasPosition, canvasPositionToPosition } from './calc'

function CanvasObjectContent(props: { object: StrategyBoardObject, readOnly?: boolean }) {
  const { object, readOnly } = props

  if (object.type === StrategyBoardObjectType.Text) {
    return (
      <TextCanvasObject object={object} readOnly={readOnly} />
    )
  }
  if (object.type === StrategyBoardObjectType.Line) {
    return (
      <LineCanvasObject object={object} readOnly={readOnly} />
    )
  }
  if (object.type === StrategyBoardObjectType.Rectangle) {
    return (
      <RectangleCanvasObject object={object} readOnly={readOnly} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicCircleAoE) {
    return (
      <CircleCanvasObject object={object} readOnly={readOnly} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicConeAoE) {
    return (
      <ConeCanvasObject object={object} readOnly={readOnly} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicDonutAoE) {
    return (
      <ArcCanvasObject object={object} readOnly={readOnly} />
    )
  }
  return (
    <ImageCanvasObject object={object} readOnly={readOnly} />
  )
}

export interface StrategyBoardCanvasObjectPreviewProps {
  objectType: StrategyBoardObjectType
}

export function StrategyBoardCanvasObjectPreview(props: StrategyBoardCanvasObjectPreviewProps) {
  const { objectType } = props

  const previewCanvasSize = 512
  const object = createObject(objectType, canvasPositionToPosition({ x: previewCanvasSize / 2, y: previewCanvasSize / 2 }))
  
  return (
    <div className="size-0">
      <Stage
        width={previewCanvasSize}
        height={previewCanvasSize}
        style={{ margin: -previewCanvasSize / 2 }}
      >
        <Layer>
          <Group x={previewCanvasSize / 2} y={previewCanvasSize / 2}>
            <CanvasObjectContent object={object} readOnly />
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}

function CanvasObject(props: { id: string, readOnly?: boolean }) {
  const { id, readOnly } = props

  const { selectObjects, toggleObjectSelected, getObject, setObjectPosition } = useStrategyBoard()
  
  const object = getObject(id)!
  const { visible, locked, position } = object

  // 按下选中图形
  const handlePointerDown = useCallback((event: Konva.KonvaEventObject<PointerEvent>) => {
    event.cancelBubble = true
    if (event.evt.shiftKey || event.evt.ctrlKey) {
      toggleObjectSelected(id)
    } else {
      selectObjects([id])
    }
  }, [id, selectObjects, toggleObjectSelected])

  // 拖动图形位置
  const handleDragStart = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(id, position)
  }, [id, setObjectPosition])
  const handleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(id, position)
  }, [id, setObjectPosition])
  const handleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(id, position)
  }, [id, setObjectPosition])

  return (
    <Group
      {...positionToCanvasPosition(position)}
      visible={visible}
      draggable={!readOnly && !locked}
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <CanvasObjectContent object={object} readOnly={readOnly} />
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

  const [backgroundImage] = useImage(ffxivImageUrl(backgroundOption.image))

  // 在空白区域按下取消选中图形
  const handleStagePointerDown = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event.evt.shiftKey || event.evt.ctrlKey) return
    selectObjects([])
  }, [selectObjects])

  return (
    <div style={{ width: canvasWidth, height: canvasHeight }}>
      <Stage width={canvasWidth} height={canvasHeight} onPointerDown={handleStagePointerDown}>
        <Layer>
          <Image
            width={canvasWidth}
            height={canvasHeight}
            image={backgroundImage}
            alt={backgroundOption.name}
            fill="#595959"
          />
        </Layer>
        <Layer>
          <Group x={canvasWidth / 2} y={canvasHeight / 2}>
            {scene.objects.slice().reverse().map(({ id }) => (
              <CanvasObject key={id} id={id} readOnly={readOnly} />
            ))}
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}
