'use client'

import { MouseEventHandler, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger, ContextMenu, ContextMenuGroup, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Undo2, Redo2, Scissors, Copy, ClipboardPaste, FlipHorizontal2, FlipVertical2, CopyCheck, Trash2 } from 'lucide-react'
import Konva from 'konva'
import { Stage, Layer, Group, Image } from 'react-konva'
import useImage from 'use-image'
import { StrategyBoardObject, StrategyBoardObjectType, sceneWidth, sceneHeight, createObject } from '@/lib/ffxiv-strategy-board'
import { isMac, ffxivImageUrl } from '@/lib/utils'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'
import { useStrategyBoardCanvas } from './context'
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
    <div className="size-0">
      <Stage
        width={previewCanvasSize}
        height={previewCanvasSize}
        style={{ margin: -previewCanvasSize / 2 }}
      >
        <Layer listening={false}>
          <Group x={previewCanvasSize / 2} y={previewCanvasSize / 2}>
            <CanvasObjectContent object={object} />
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}

function CanvasObject(props: { id: string }) {
  const { id } = props

  const { getObject } = useStrategyBoard()
  const { zoomRatio } = useStrategyBoardCanvas()

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
        draggable={!locked}
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

export function StrategyBoardCanvas() {
  const {
    scene,
    selectedObjectIds,
    selectObjects,
    deselectObject,
    deleteObjects,
    isClipboardEmpty,
    cutObjects,
    copyObjects,
    pasteObjects,
    isUndoAvailable,
    undo,
    isRedoAvailable,
    redo,
  } = useStrategyBoard()
  const { canvasSize, setCanvasSize, setCanvasOffset, zoomRatio, moveObjects, flipObjectsHorizontally, flipObjectsVertically } = useStrategyBoardCanvas()

  const backgroundOption = backgroundOptions.get(scene.background)!

  const [backgroundImage] = useImage(ffxivImageUrl(backgroundOption.image))

  // 根据容器尺寸缩放画布
  const stageContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const stageContainer = stageContainerRef.current
    if (!stageContainer) return
    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize({
        width: stageContainer.offsetWidth,
        height: stageContainer.offsetHeight,
      })
    })
    resizeObserver.observe(stageContainer)
    return () => resizeObserver.unobserve(stageContainer)
  }, [setCanvasSize])

  // 选择图形
  const [selectedObjectOnPointerDown, setSelectedObjectOnPointerDown] = useState<boolean>(false)

  const handleStagePointerDown = useCallback((event: Konva.KonvaEventObject<PointerEvent>): void => {
    if (event.evt.button === 0) {
      event.evt.preventDefault()
      selectObjects([])
      // TODO: 框选
      return
    }
  }, [selectObjects])
  const handleObjectPointerDown = useCallback((id: string, event: Konva.KonvaEventObject<PointerEvent>): void => {
    setSelectedObjectOnPointerDown(false)
    if (selectedObjectIds.includes(id)) return
    if (event.evt.shiftKey || event.evt.ctrlKey) {
      selectObjects([...selectedObjectIds, id])
    } else {
      selectObjects([id])
    }
    setSelectedObjectOnPointerDown(true)
  }, [selectedObjectIds, selectObjects])
  const handleObjectClick = useCallback((id: string, event: Konva.KonvaEventObject<MouseEvent>): void => {
    setSelectedObjectOnPointerDown(false)
    if (selectedObjectOnPointerDown) return
    if (event.evt.button === 2) return
    if (event.evt.shiftKey || event.evt.ctrlKey) {
      deselectObject(id)
    } else {
      selectObjects([id])
    }
  }, [selectedObjectOnPointerDown, selectObjects, deselectObject])

  // 右键菜单
  const handleContextMenuUndoClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    undo()
  }, [undo])
  const handleContextMenuRedoClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    redo()
  }, [redo])

  const handleContextMenuCutClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    cutObjects(selectedObjectIds)
  }, [cutObjects, selectedObjectIds])
  const handleContextMenuCopyClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    copyObjects(selectedObjectIds)
  }, [copyObjects, selectedObjectIds])
  const handleContextMenuPasteClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    pasteObjects()
  }, [pasteObjects])

  const handleContextMenuFlipHorizontallyClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    flipObjectsHorizontally(selectedObjectIds)
  }, [flipObjectsHorizontally, selectedObjectIds])
  const handleContextMenuFlipVerticallyClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    flipObjectsVertically(selectedObjectIds)
  }, [flipObjectsVertically, selectedObjectIds])

  const handleContextMenuSelectAllClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    selectObjects(scene.objects.map(object => object.id))
  }, [selectObjects, scene])

  const handleContextMenuDeleteClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    deleteObjects(selectedObjectIds)
  }, [deleteObjects, selectedObjectIds])

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
  const moveObjectsTemporarily = useCallback((dragHandle: Konva.Node, positions: { id: string, position: { x: number, y: number } }[]): void => {
    const stage = stageRef.current
    if (!stage) return
    dragHandle.position({ x: 0, y: 0 })
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

  const handleObjectDragHandleDragStart = useCallback((dragHandle: Konva.Node): void => {
    const draggingObject = dragHandle.findAncestor('.object')
    const id = draggingObject?.getAttr('data-id') as string
    if (!draggingObject || !id) return
    if (selectedObjectIds.includes(id)) {
      draggingObjectsRef.current = selectedObjectIds.map(id => stageRef.current?.findOne(`.object-${id}`)).filter(object => !!object)
    } else {
      selectObjects([id])
      draggingObjectsRef.current = [draggingObject]
    }
  }, [selectedObjectIds, selectObjects])
  const handleObjectDragHandleDragMove = useCallback((dragHandle: Konva.Node): void => {
    const positions = getPositionsFromDraggingObject(dragHandle)
    moveObjectsTemporarily(dragHandle, positions)
  }, [getPositionsFromDraggingObject, moveObjectsTemporarily])
  const handleObjectDragHandleDragEnd = useCallback((dragHandle: Konva.Node): void => {
    const positions = getPositionsFromDraggingObject(dragHandle)
    draggingObjectsRef.current = null
    moveObjectsTemporarily(dragHandle, positions)
    moveObjects(positions)
  }, [getPositionsFromDraggingObject, moveObjectsTemporarily, moveObjects])

  // 拖动画布
  const [isDraggingStage, setIsDraggingStage] = useState<boolean>(false)

  const handleStageDragStart = useCallback((): void => {
    setIsDraggingStage(true)
  }, [])
  const handleStageDragMove = useCallback((): void => {
  }, [])
  const handleStageDragEnd = useCallback((stage: Konva.Stage): void => {
    setIsDraggingStage(false)
    setCanvasOffset(stage.position())
  }, [setCanvasOffset])

  const handlePointerDown = useCallback((event: Konva.KonvaEventObject<PointerEvent>): void => {
    const canvasObject = event.target.findAncestor('.object', true)
    if (canvasObject) {
      const id = canvasObject.getAttr('data-id') as string
      handleObjectPointerDown(id, event)
      return
    }
    const boundingBox = event.target.findAncestor('.object-bounding-box', true)
    if (boundingBox) {
      return
    }
    handleStagePointerDown(event)
  }, [handleStagePointerDown, handleObjectPointerDown])

  const handleClick = useCallback((event: Konva.KonvaEventObject<MouseEvent>): void => {
    const canvasObject = event.target.findAncestor('.object', true)
    if (canvasObject) {
      const id = canvasObject.getAttr('data-id') as string
      handleObjectClick(id, event)
      return
    }
  }, [handleObjectClick])

  const handleDragStart = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    if (event.target instanceof Konva.Stage) {
      handleStageDragStart()
      return
    }
    if (event.target.hasName('object-drag-handle')) {
      handleObjectDragHandleDragStart(event.target)
    }
  }, [handleStageDragStart, handleObjectDragHandleDragStart])
  const handleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    if (event.target instanceof Konva.Stage) {
      handleStageDragMove()
      return
    }
    if (event.target.hasName('object-drag-handle')) {
      handleObjectDragHandleDragMove(event.target)
    }
  }, [handleStageDragMove, handleObjectDragHandleDragMove])
  const handleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    if (event.target instanceof Konva.Stage) {
      handleStageDragEnd(event.target)
      return
    }
    if (event.target.hasName('object-drag-handle')) {
      handleObjectDragHandleDragEnd(event.target)
    }
  }, [handleStageDragEnd, handleObjectDragHandleDragEnd])

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          ref={stageContainerRef}
          className="size-full data-dragging-stage:cursor-grabbing"
          data-dragging-stage={isDraggingStage ? 'dragging' : null}
        >
          <Stage
            ref={stageRef}
            offsetX={-canvasSize.width / 2}
            offsetY={-canvasSize.height / 2}
            width={canvasSize.width}
            height={canvasSize.height}
            draggable
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <Layer>
              <Image
                offsetX={sceneWidth / 2 * zoomRatio}
                offsetY={sceneHeight / 2 * zoomRatio}
                width={sceneWidth * zoomRatio}
                height={sceneHeight * zoomRatio}
                image={backgroundImage}
                alt={backgroundOption.name}
                shadowBlur={16}
                shadowOffsetY={12}
                shadowOpacity={0.2}
                fill="#595959"
              />
              {scene.objects.slice().reverse().map(({ id }) => (
                <CanvasObject key={id} id={id} />
              ))}
            </Layer>
            <Layer>
              {scene.objects.slice().reverse().map(({ id }) => (
                <CanvasObjectBoundingBox key={id} id={id} />
              ))}
            </Layer>
          </Stage>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem disabled={!isUndoAvailable} onClick={handleContextMenuUndoClick}>
            <Undo2 /> 撤销
            <ContextMenuShortcut>{isMac() ? '⌘Z' : 'Ctrl+Z'}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled={!isRedoAvailable} onClick={handleContextMenuRedoClick}>
            <Redo2 /> 重做
            <ContextMenuShortcut>{isMac() ? '⇧⌘Z' : 'Ctrl+Y'}</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem disabled={!selectedObjectIds.length} onClick={handleContextMenuCutClick}>
            <Scissors /> 剪切
            <ContextMenuShortcut>{isMac() ? '⌘X' : 'Ctrl+X'}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled={!selectedObjectIds.length} onClick={handleContextMenuCopyClick}>
            <Copy /> 复制
            <ContextMenuShortcut>{isMac() ? '⌘C' : 'Ctrl+C'}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled={isClipboardEmpty} onClick={handleContextMenuPasteClick}>
            <ClipboardPaste /> 粘贴
            <ContextMenuShortcut>{isMac() ? '⌘V' : 'Ctrl+V'}</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem disabled={!selectedObjectIds.length} onClick={handleContextMenuFlipHorizontallyClick}>
            <FlipHorizontal2 /> 水平翻转
          </ContextMenuItem>
          <ContextMenuItem disabled={!selectedObjectIds.length} onClick={handleContextMenuFlipVerticallyClick}>
            <FlipVertical2 /> 垂直翻转
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleContextMenuSelectAllClick}>
            <CopyCheck /> 全选
            <ContextMenuShortcut>{isMac() ? '⌘A' : 'Ctrl+A'}</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem variant="destructive" onClick={handleContextMenuDeleteClick}>
            <Trash2 /> 删除
            <ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function StrategyBoardCanvasPreview() {
  const { scene } = useStrategyBoard()
  const { canvasSize, setCanvasSize, zoomRatio, zoomTo } = useStrategyBoardCanvas()

  const backgroundOption = backgroundOptions.get(scene.background)!

  const [backgroundImage] = useImage(ffxivImageUrl(backgroundOption.image))

  // 根据容器尺寸缩放画布
  const stageContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const stageContainer = stageContainerRef.current
    if (!stageContainer) return
    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize({
        width: stageContainer.offsetWidth,
        height: stageContainer.offsetHeight,
      })
      zoomTo(Math.min(stageContainer.offsetWidth / sceneWidth, stageContainer.offsetHeight / sceneHeight))
    })
    resizeObserver.observe(stageContainer)
    return () => resizeObserver.unobserve(stageContainer)
  }, [setCanvasSize, zoomTo])

  return (
    <div
      ref={stageContainerRef}
      className="size-full flex items-center justify-center"
    >
      <Stage
        offsetX={-canvasSize.width / 2}
        offsetY={-canvasSize.height / 2}
        width={canvasSize.width}
        height={canvasSize.height}
      >
        <Layer listening={false}>
          <Image
            offsetX={sceneWidth / 2 * zoomRatio}
            offsetY={sceneHeight / 2 * zoomRatio}
            width={sceneWidth * zoomRatio}
            height={sceneHeight * zoomRatio}
            image={backgroundImage}
            alt={backgroundOption.name}
            fill="#595959"
          />
          {scene.objects.slice().reverse().map(({ id }) => (
            <CanvasObject key={id} id={id} />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
