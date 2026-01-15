'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Stage, Layer, Group, Image } from 'react-konva'
import useImage from 'use-image'
import { StrategyBoardObject, StrategyBoardObjectType, sceneWidth, sceneHeight, createObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'
import { StrategyBoardCanvasProvider, useStrategyBoardCanvas } from './context'
import { TextCanvasObject } from './text'
import { LineCanvasObject } from './line'
import { RectangleCanvasObject } from './rectangle'
import { CircleCanvasObject } from './circle'
import { ConeCanvasObject } from './cone'
import { ArcCanvasObject } from './arc'
import { ImageCanvasObject } from './image'

interface CanvasObjectContentProps {
  object: StrategyBoardObject
}

function CanvasObjectContent(props: CanvasObjectContentProps) {
  const { object } = props

  if (object.type === StrategyBoardObjectType.Text) {
    return (
      <TextCanvasObject object={object} />
    )
  }
  if (object.type === StrategyBoardObjectType.Line) {
    return (
      <LineCanvasObject object={object} />
    )
  }
  if (object.type === StrategyBoardObjectType.Rectangle) {
    return (
      <RectangleCanvasObject object={object} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicCircleAoE) {
    return (
      <CircleCanvasObject object={object} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicConeAoE) {
    return (
      <ConeCanvasObject object={object} />
    )
  }
  if (object.type === StrategyBoardObjectType.MechanicDonutAoE) {
    return (
      <ArcCanvasObject object={object} />
    )
  }
  return (
    <ImageCanvasObject object={object} />
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
    <StrategyBoardCanvasProvider readOnly>
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
    </StrategyBoardCanvasProvider>
  )
}

function CanvasObject(props: { id: string }) {
  const { id } = props

  const { selectedObjectIds, selectObjects, toggleObjectSelected, getObject } = useStrategyBoard()
  const { readOnly, zoomRatio, setObjectsPosition } = useStrategyBoardCanvas()
  
  const object = getObject(id)!
  const { visible, locked, position } = object

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
        x: Math.min(Math.max(canvasPosition.x, -sceneWidth * zoomRatio / 2), sceneWidth * zoomRatio / 2),
        y: Math.min(Math.max(canvasPosition.y, -sceneHeight * zoomRatio / 2), sceneHeight * zoomRatio / 2),
      }
      canvasObject.position(boundedCanvasPosition)
      boundingBox?.position(boundedCanvasPosition)
      objectsCanvasPositions.push({ id: selectedObjectId, position: boundedCanvasPosition })
    })
    return objectsCanvasPositions
  }, [zoomRatio, id])

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
    const positions = canvasPositions.map(({ id, position }) => ({ id, position: { x: position.x / zoomRatio, y: position.y / zoomRatio } }))
    setObjectsPosition(positions)
  }, [zoomRatio, setObjectsPosition, moveSelectedCanvasObject, stopMovingSelectedCanvasObject])

  return (
    <Group
      ref={canvasObjectRef}
      name={`object-${id}`}
      x={position.x * zoomRatio}
      y={position.y * zoomRatio}
      visible={visible}
      draggable={!readOnly && !locked}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <CanvasObjectContent
        object={object}
      />
    </Group>
  )
}

function CanvasObjectBoundingBox(props: { id: string }) {
  const { id } = props

  const { getObject } = useStrategyBoard()
  const { zoomRatio } = useStrategyBoardCanvas()
  
  const object = getObject(id)!
  const { visible, position } = object

  return (
    <Group
      name={`object-${id}-bounding-box`}
      x={position.x * zoomRatio}
      y={position.y * zoomRatio}
      visible={visible}
    />
  )
}

export function StrategyBoardCanvasScene() {
  const { scene, selectObjects } = useStrategyBoard()
  const { readOnly, zoomRatio } = useStrategyBoardCanvas()

  const backgroundOption = backgroundOptions.get(scene.background)!

  const [backgroundImage] = useImage(ffxivImageUrl(backgroundOption.image))

  // 在空白区域按下取消选中图形
  const handleStageClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>): void => {
    if (event.evt.shiftKey || event.evt.ctrlKey) return
    selectObjects([])
  }, [selectObjects])

  return (
    <div style={{ width: sceneWidth * zoomRatio, height: sceneHeight * zoomRatio }}>
      <Stage width={sceneWidth * zoomRatio} height={sceneHeight * zoomRatio} onClick={handleStageClick}>
        <Layer listening={false}>
          <Image
            width={sceneWidth * zoomRatio}
            height={sceneHeight * zoomRatio}
            image={backgroundImage}
            alt={backgroundOption.name}
            fill="#595959"
          />
        </Layer>
        <Layer listening={!readOnly}>
          <Group x={sceneWidth * zoomRatio / 2} y={sceneHeight * zoomRatio / 2}>
            {scene.objects.slice().reverse().map(({ id }) => (
              <CanvasObject key={id} id={id} />
            ))}
          </Group>
        </Layer>
        {!readOnly && (
          <Layer>
            <Group x={sceneWidth * zoomRatio / 2} y={sceneHeight * zoomRatio / 2}>
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

export interface StrategyBoardCanvasProps {
  readOnly?: boolean
}

export function StrategyBoardCanvas(props: StrategyBoardCanvasProps) {
  const { readOnly } = props

  return (
    <StrategyBoardCanvasProvider readOnly={readOnly}>
      <StrategyBoardCanvasScene />
    </StrategyBoardCanvasProvider>
  )
}
