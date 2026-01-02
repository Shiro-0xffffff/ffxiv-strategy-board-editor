'use client'

import { useCallback } from 'react'
import useImage from 'use-image'
import Konva from 'konva'
import { Stage, Layer, Group, Image } from 'react-konva'
import { StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'
import { TextCanvasObject } from './text'
import { LineCanvasObject } from './line'
import { RectangleCanvasObject } from './rectangle'
import { ConeCanvasObject } from './cone'
import { ArcCanvasObject } from './arc'
import { ImageCanvasObject } from './image'
import { canvasWidth, canvasHeight, positionToCanvasPosition, canvasPositionToPosition } from './calc'

export interface CanvasObjectProps {
  id: string
  readOnly?: boolean
}

export function CanvasObject(props: CanvasObjectProps) {
  const { id, readOnly } = props

  const { selectedObjectIds, selectObjects, getObject, setObjectPosition } = useStrategyBoard()
  
  const object = getObject(id)!
  const { type, visible, locked, position } = object

  // 点击选中图形
  const handleCanvasObjectClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    event.cancelBubble = true

    const isObjectSelected = selectedObjectIds.includes(id)

    if (event.evt.shiftKey || event.evt.ctrlKey) {
      if (isObjectSelected) {
        selectObjects(selectedObjectIds.filter(selectedObjectIndex => selectedObjectIndex !== id))
      } else {
        selectObjects([...selectedObjectIds, id])
      }
      return
    }

    if (!isObjectSelected) selectObjects([id])
  }, [id, selectObjects, selectedObjectIds])

  // 拖动图形位置
  const handleCanvasObjectDragStart = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    selectObjects([id])
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(id, position)
  }, [id, selectObjects, setObjectPosition])
  const handleCanvasObjectDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(id, position)
  }, [id, setObjectPosition])
  const handleCanvasObjectDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const position = canvasPositionToPosition({ x: event.target.x(), y: event.target.y() })
    setObjectPosition(id, position)
  }, [id, setObjectPosition])

  return (
    <Group
      {...positionToCanvasPosition(position)}
      visible={visible}
      draggable={!readOnly && !locked}
      onClick={handleCanvasObjectClick}
      onDragStart={handleCanvasObjectDragStart}
      onDragMove={handleCanvasObjectDragMove}
      onDragEnd={handleCanvasObjectDragEnd}
    >
      {(() => {
        if (type === StrategyBoardObjectType.Text) {
          return (
            <TextCanvasObject object={object} readOnly={readOnly} />
          )
        }
        if (type === StrategyBoardObjectType.Line) {
          return (
            <LineCanvasObject object={object} readOnly={readOnly} />
          )
        }
        if (type === StrategyBoardObjectType.Rectangle) {
          return (
            <RectangleCanvasObject object={object} readOnly={readOnly} />
          )
        }
        if (type === StrategyBoardObjectType.MechanicConeAoE) {
          return (
            <ConeCanvasObject object={object} readOnly={readOnly} />
          )
        }
        if (type === StrategyBoardObjectType.MechanicDonutAoE) {
          return (
            <ArcCanvasObject object={object} readOnly={readOnly} />
          )
        }
        return (
          <ImageCanvasObject object={object} readOnly={readOnly} />
        )
      })()}
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

  // 点击空白区域取消选中图形
  const handleStageClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event.evt.shiftKey || event.evt.ctrlKey) return
    selectObjects([])
  }, [selectObjects])

  return (
    <div style={{ width: canvasWidth, height: canvasHeight }}>
      <Stage width={canvasWidth} height={canvasHeight} onClick={handleStageClick}>
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
          {scene.objects.slice().reverse().map(({ id }) => (
            <CanvasObject key={id} id={id} readOnly={readOnly} />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
