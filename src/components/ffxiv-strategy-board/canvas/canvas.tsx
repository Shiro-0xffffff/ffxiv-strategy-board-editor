'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Stage, Layer, Group, Image } from 'react-konva'
import useImage from 'use-image'
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

function CanvasObjectContent(props: { object: StrategyBoardObject, selected?: boolean, onResize?: (size: number) => void, onRotate?: (rotation: number) => void }) {
  const { object, ...restProps } = props

  if (object.type === StrategyBoardObjectType.Text) {
    return (
      <TextCanvasObject object={object} {...restProps} />
    )
  }
  if (object.type === StrategyBoardObjectType.Line) {
    return (
      <LineCanvasObject object={object} {...restProps} />
    )
  }
  if (object.type === StrategyBoardObjectType.Rectangle) {
    return (
      <RectangleCanvasObject object={object} {...restProps} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicCircleAoE) {
    return (
      <CircleCanvasObject object={object} {...restProps} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicConeAoE) {
    return (
      <ConeCanvasObject object={object} {...restProps} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicDonutAoE) {
    return (
      <ArcCanvasObject object={object} {...restProps} />
    )
  }
  return (
    <ImageCanvasObject object={object} {...restProps} />
  )
}

export interface StrategyBoardCanvasObjectPreviewProps {
  objectType: StrategyBoardObjectType
}

export function StrategyBoardCanvasObjectPreview(props: StrategyBoardCanvasObjectPreviewProps) {
  const { objectType } = props

  const previewCanvasSize = 512
  const object = createObject(objectType)
  
  return (
    <div className="size-0">
      <Stage
        width={previewCanvasSize}
        height={previewCanvasSize}
        style={{ margin: -previewCanvasSize / 2 }}
      >
        <Layer>
          <Group x={previewCanvasSize / 2} y={previewCanvasSize / 2}>
            <CanvasObjectContent object={object} />
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}

function CanvasObject(props: { id: string, readOnly?: boolean }) {
  const { id, readOnly } = props

  const { selectedObjectIds, selectObjects, toggleObjectSelected, getObject, setObjectsPosition, resizeObject, rotateObject } = useStrategyBoard()
  
  const object = getObject(id)!
  const { visible, locked, position } = object
  const selected = selectedObjectIds.includes(id)

  // 选中图形
  const handleClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>): void => {
    event.cancelBubble = true
    if (readOnly) return
    if (event.evt.shiftKey || event.evt.ctrlKey) {
      toggleObjectSelected(id)
    } else {
      selectObjects([id])
    }
  }, [id, readOnly, selectObjects, toggleObjectSelected])

  // 移动图形
  const canvasObjectRef = useRef<Konva.Group>(null)
  const canvasSelectionRef = useRef<Map<string, { canvasObject: Konva.Node, boundingBox?: Konva.Node, dragStartPosition: { x: number, y: number } }>>(null)

  const startMovingSelectedCanvasObject = useCallback((selectedObjectIds: string[]): void => {
    const stage = canvasObjectRef.current?.getStage()
    if (!canvasObjectRef.current || !stage) return
    const canvasSelection: typeof canvasSelectionRef.current = new Map()
    selectedObjectIds.forEach(selectedObjectId => {
      const canvasObject = selectedObjectId === id ? canvasObjectRef.current : stage.findOne(`.object-${selectedObjectId}`)
      if (!canvasObject) return
      const boundingBox = stage.findOne(`.object-${selectedObjectId}-bounding-box`)
      const dragStartPosition = canvasObject.position()
      canvasSelection.set(selectedObjectId, { canvasObject, boundingBox, dragStartPosition })
    })
    canvasSelectionRef.current = canvasSelection
  }, [id])
  const stopMovingSelectedCanvasObject = useCallback((): void => {
    canvasSelectionRef.current = null
  }, [])
  const moveSelectedCanvasObject = useCallback((): { id: string, position: { x: number, y: number } }[] => {
    const stage = canvasObjectRef.current?.getStage()
    const canvasSelection = canvasSelectionRef.current
    if (!canvasObjectRef.current || !stage || !canvasSelection) return []
    const dragStartPosition = canvasSelection.get(id)?.dragStartPosition
    const draggingOffset = dragStartPosition ? {
      x: canvasObjectRef.current.x() - dragStartPosition.x,
      y: canvasObjectRef.current.y() - dragStartPosition.y,
    } : null
    const objectsCanvasPositions: { id: string, position: { x: number, y: number } }[] = []
    canvasSelection.forEach(({ canvasObject, boundingBox, dragStartPosition }, selectedObjectId) => {
      const canvasPosition = selectedObjectId === id || !draggingOffset ? canvasObject.position() : {
        x: dragStartPosition.x + draggingOffset.x,
        y: dragStartPosition.y + draggingOffset.y,
      }
      const boundedCanvasPosition = {
        x: Math.min(Math.max(canvasPosition.x, -canvasWidth / 2), canvasWidth / 2),
        y: Math.min(Math.max(canvasPosition.y, -canvasHeight / 2), canvasHeight / 2),
      }
      canvasObject.position(boundedCanvasPosition)
      boundingBox?.position(boundedCanvasPosition)
      objectsCanvasPositions.push({ id: selectedObjectId, position: boundedCanvasPosition })
    })
    return objectsCanvasPositions
  }, [id])

  const handleDragStart = useCallback((): void => {
    if (selectedObjectIds.includes(id)) {
      startMovingSelectedCanvasObject(selectedObjectIds)
    } else {
      selectObjects([id])
      startMovingSelectedCanvasObject([id])
    }
  }, [id, selectedObjectIds, selectObjects, startMovingSelectedCanvasObject])
  const handleDragMove = useCallback((): void => {
    moveSelectedCanvasObject()
  }, [moveSelectedCanvasObject])
  const handleDragEnd = useCallback((): void => {
    const canvasPositions = moveSelectedCanvasObject()
    stopMovingSelectedCanvasObject()
    const positions = canvasPositions.map(({ id, position }) => ({ id, position: canvasPositionToPosition(position) }))
    setObjectsPosition(positions)
  }, [setObjectsPosition, moveSelectedCanvasObject, stopMovingSelectedCanvasObject])

  // 缩放图形
  const handleCanvasObjectContentResize = useCallback((size: number): void => {
    resizeObject(id, size)
  }, [id, resizeObject])

  // 旋转图形
  const handleCanvasObjectContentRotate = useCallback((rotation: number): void => {
    rotateObject(id, rotation)
  }, [id, rotateObject])

  return (
    <Group
      ref={canvasObjectRef}
      name={`object-${id}`}
      {...positionToCanvasPosition(position)}
      visible={visible}
      draggable={!readOnly && !locked}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <CanvasObjectContent
        object={object}
        selected={!readOnly && selected}
        onResize={handleCanvasObjectContentResize}
        onRotate={handleCanvasObjectContentRotate}
      />
    </Group>
  )
}

function CanvasObjectBoundingBox(props: { id: string }) {
  const { id } = props

  const { getObject } = useStrategyBoard()
  
  const object = getObject(id)!
  const { visible, position } = object

  return (
    <Group
      name={`object-${id}-bounding-box`}
      {...positionToCanvasPosition(position)}
      visible={visible}
    />
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
  const handleStageClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>): void => {
    if (event.evt.shiftKey || event.evt.ctrlKey) return
    selectObjects([])
  }, [selectObjects])

  return (
    <div style={{ width: canvasWidth, height: canvasHeight }}>
      <Stage width={canvasWidth} height={canvasHeight} onClick={handleStageClick}>
        <Layer listening={false}>
          <Image
            width={canvasWidth}
            height={canvasHeight}
            image={backgroundImage}
            alt={backgroundOption.name}
            fill="#595959"
          />
        </Layer>
        <Layer listening={!readOnly}>
          <Group x={canvasWidth / 2} y={canvasHeight / 2}>
            {scene.objects.slice().reverse().map(({ id }) => (
              <CanvasObject key={id} id={id} readOnly={readOnly} />
            ))}
          </Group>
        </Layer>
        {!readOnly && (
          <Layer>
            <Group x={canvasWidth / 2} y={canvasHeight / 2}>
              {scene.objects.slice().reverse().map(({ id }) => (
                <CanvasObjectBoundingBox key={id} id={id} />
              ))}
            </Group>
          </Layer>
        )}
      </Stage>
    </div>
  )
}
