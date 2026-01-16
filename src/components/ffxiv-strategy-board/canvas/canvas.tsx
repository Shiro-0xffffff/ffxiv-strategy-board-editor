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
    <StrategyBoardCanvasProvider preview>
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

  const { getObject } = useStrategyBoard()
  const { preview, zoomRatio } = useStrategyBoardCanvas()
  
  const object = getObject(id)!
  const { visible, locked, position } = object

  return (
    <Group
      data-id={id}
      name={`object object-${id}`}
      x={position.x * zoomRatio}
      y={position.y * zoomRatio}
      visible={visible}
    >
      <Group
        name="object-drag-handle"
        x={0}
        y={0}
        draggable={!preview && !locked}
      >
        <CanvasObjectContent object={object} />
      </Group>
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
      data-id={id}
      name={`object-bounding-box object-${id}-bounding-box`}
      x={position.x * zoomRatio}
      y={position.y * zoomRatio}
      visible={visible}
    />
  )
}

export function StrategyBoardCanvasScene() {
  const { scene, selectedObjectIds, selectObjects, toggleObjectSelected } = useStrategyBoard()
  const { preview, zoomRatio, moveObjects } = useStrategyBoardCanvas()

  const backgroundOption = backgroundOptions.get(scene.background)!

  const [backgroundImage] = useImage(ffxivImageUrl(backgroundOption.image))

  // 选中图形
  const handleClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>): void => {
    if (preview) return
    const id = event.target.findAncestor('.object', true)?.getAttr('data-id') as string
    if (event.evt.shiftKey || event.evt.ctrlKey) {
      if (id) toggleObjectSelected(id)
    } else {
      selectObjects(id ? [id] : [])
    }
  }, [preview, selectObjects, toggleObjectSelected])

  // 右键菜单
  const handleContextMenu = useCallback((event: Konva.KonvaEventObject<PointerEvent>): void => {
    event.evt.preventDefault()
    // TODO
  }, [])

  // 移动图形
  const stageRef = useRef<Konva.Stage>(null)
  const draggingObjectsRef = useRef<Konva.Node[]>(null)

  const getPositionsFromDraggingObject = useCallback((dragHandle: Konva.Node): { id: string, position: { x: number, y: number } }[] => {
    const stage = stageRef.current
    const draggingObjects = draggingObjectsRef.current
    const draggingObject = dragHandle.findAncestor('.object')
    if (!stage || !draggingObjects || !draggingObject) return []
    const position = {
      x: (draggingObject.x() + dragHandle.x()) / zoomRatio,
      y: (draggingObject.y() + dragHandle.y()) / zoomRatio,
    }
    const normalizedPosition = {
      x: Math.round(Math.min(Math.max(position.x, -sceneWidth / 2), sceneWidth / 2)),
      y: Math.round(Math.min(Math.max(position.y, -sceneHeight / 2), sceneHeight / 2)),
    }
    const positionOffset = {
      x: normalizedPosition.x - draggingObject.x() / zoomRatio,
      y: normalizedPosition.y - draggingObject.y() / zoomRatio,
    }
    const positions = draggingObjects.map(canvasObject => {
      const id = canvasObject.getAttr('data-id') as string
      const position = {
        x: canvasObject.x() / zoomRatio + positionOffset.x,
        y: canvasObject.y() / zoomRatio + positionOffset.y,
      }
      const normalizedPosition = {
        x: Math.round(Math.min(Math.max(position.x, -sceneWidth / 2), sceneWidth / 2)),
        y: Math.round(Math.min(Math.max(position.y, -sceneHeight / 2), sceneHeight / 2)),
      }
      return { id, position: normalizedPosition }
    })
    return positions
  }, [zoomRatio])
  const moveObjectsTemporarily = useCallback((draggingCanvasObject: Konva.Node, positions: { id: string, position: { x: number, y: number } }[]): void => {
    const stage = stageRef.current
    if (!stage) return
    draggingCanvasObject.position({ x: 0, y: 0 })
    positions.forEach(({ id, position }) => {
      const canvasObject = stage.findOne(`.object-${id}`)
      if (!canvasObject) return
      canvasObject.position({
        x: position.x * zoomRatio,
        y: position.y * zoomRatio,
      })
      const boundingBox = stage.findOne(`.object-${id}-bounding-box`)
      boundingBox?.position({
        x: position.x * zoomRatio,
        y: position.y * zoomRatio,
      })
    })
  }, [zoomRatio])

  const handleDragStart = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    if (event.target instanceof Konva.Stage || !event.target.hasName('object-drag-handle')) return
    const draggingObject = event.target.findAncestor('.object')
    const id = draggingObject?.getAttr('data-id') as string
    if (!draggingObject || !id) return
    if (selectedObjectIds.includes(id)) {
      draggingObjectsRef.current = selectedObjectIds.map(id => stageRef.current?.findOne(`.object-${id}`)).filter(object => !!object)
    } else {
      selectObjects([id])
      draggingObjectsRef.current = [draggingObject]
    }
  }, [selectedObjectIds, selectObjects])
  const handleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    if (event.target instanceof Konva.Stage || !event.target.hasName('object-drag-handle')) return
    const positions = getPositionsFromDraggingObject(event.target)
    moveObjectsTemporarily(event.target, positions)
  }, [getPositionsFromDraggingObject, moveObjectsTemporarily])
  const handleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    if (event.target instanceof Konva.Stage || !event.target.hasName('object-drag-handle')) return
    const positions = getPositionsFromDraggingObject(event.target)
    draggingObjectsRef.current = null
    moveObjectsTemporarily(event.target, positions)
    moveObjects(positions)
  }, [getPositionsFromDraggingObject, moveObjectsTemporarily, moveObjects])

  return (
    <div style={{ width: sceneWidth * zoomRatio, height: sceneHeight * zoomRatio }}>
      <Stage
        ref={stageRef}
        width={sceneWidth * zoomRatio}
        height={sceneHeight * zoomRatio}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <Layer listening={false}>
          <Image
            width={sceneWidth * zoomRatio}
            height={sceneHeight * zoomRatio}
            image={backgroundImage}
            alt={backgroundOption.name}
            fill="#595959"
          />
        </Layer>
        <Layer listening={!preview}>
          <Group x={sceneWidth * zoomRatio / 2} y={sceneHeight * zoomRatio / 2}>
            {scene.objects.slice().reverse().map(({ id }) => (
              <CanvasObject key={id} id={id} />
            ))}
          </Group>
        </Layer>
        {!preview && (
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
  preview?: boolean
}

export function StrategyBoardCanvas(props: StrategyBoardCanvasProps) {
  const { preview } = props

  return (
    <StrategyBoardCanvasProvider preview={preview}>
      <StrategyBoardCanvasScene />
    </StrategyBoardCanvasProvider>
  )
}
