'use client'

import { MouseEventHandler, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger, ContextMenu, ContextMenuGroup, ContextMenuSeparator } from '@/components/ui/context-menu'
import Konva from 'konva'
import { HitCanvas } from 'konva/lib/Canvas'
import { Stage, Layer, Group, Rect, Image } from 'react-konva'
import useImage from 'use-image'
import { Undo2, Redo2, Scissors, Copy, ClipboardPaste, FlipHorizontal2, FlipVertical2, CopyCheck, Trash2 } from 'lucide-react'
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
  const { visible, position } = object

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
        draggable
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
  const {
    canvasSize,
    setCanvasSize,
    setCanvasOffset,
    zoomRatio,
    zoomIn,
    zoomOut,
    moveObjects,
    flipObjectsHorizontally,
    flipObjectsVertically,
  } = useStrategyBoardCanvas()

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

  // 框选
  const hitCanvasPixelRatio = 0.125

  const [selectionRectStartPoint, setSelectionRectStartPoint] = useState<{ x: number, y: number } | null>(null)

  const selectionRectRef = useRef<Konva.Rect>(null)
  const objectHitCanvasesRef = useRef<{ id: string, selected: boolean, canvas: HitCanvas, offset: { x: number, y: number } }[]>(null)

  const handleStagePointerDown = useCallback((event: Konva.KonvaEventObject<PointerEvent>): void => {
    if (event.evt.pointerType !== 'mouse' || event.evt.button !== 0) return
    event.evt.preventDefault()
    const multiselect = event.evt.shiftKey || event.evt.ctrlKey
    if (!multiselect) selectObjects([])
    const stage = stageRef.current
    if (!stage) return
    const transformCanvasAxisToStageAxis = stage.getTransform().copy().invert()
    objectHitCanvasesRef.current = stage.find('.object').map(canvasObject => {
      const id = canvasObject.getAttr('data-id') as string
      const selected = multiselect && selectedObjectIds.includes(id)
      const rect = canvasObject.getClientRect({ skipShadow: true, skipStroke: true, relativeTo: stage })
      const canvas = new HitCanvas({ width: rect.width, height: rect.height, pixelRatio: hitCanvasPixelRatio / zoomRatio })
      const context = canvas.getContext()
      context.transform(...transformCanvasAxisToStageAxis.getMatrix() as [number, number, number, number, number, number])
      context.translate(-rect.x, -rect.y)
      canvasObject.drawHit(canvas)
      const offset = {
        x: rect.x * hitCanvasPixelRatio / zoomRatio,
        y: rect.y * hitCanvasPixelRatio / zoomRatio,
      }
      return { id, selected, canvas, offset }
    })
    selectionRectRef.current?.size({ width: 0, height: 0 })
    const pointerPosition = stage.getRelativePointerPosition()
    setSelectionRectStartPoint({ x: (pointerPosition?.x ?? 0) / zoomRatio, y: (pointerPosition?.y ?? 0) / zoomRatio })
  }, [zoomRatio, selectedObjectIds, selectObjects])

  const handleWindowPointerMove = useCallback((event: PointerEvent): void => {
    if (!selectionRectStartPoint || !objectHitCanvasesRef.current) return
    const multiselect = event.shiftKey || event.ctrlKey
    const stage = stageRef.current
    const selectionRect = selectionRectRef.current
    if (!stage || !selectionRect) return
    const transformCanvasAxisToStageAxis = stage.getTransform().copy().invert()
    const stageBoundingRect = stage.container().getBoundingClientRect()
    const pointerPosition = transformCanvasAxisToStageAxis.point({
      x: event.clientX - stageBoundingRect.x,
      y: event.clientY - stageBoundingRect.y,
    })
    const selectionRectEndPoint = {
      x: pointerPosition.x / zoomRatio,
      y: pointerPosition.y / zoomRatio,
    }
    const selectionRectSize = {
      width: selectionRectEndPoint.x - selectionRectStartPoint.x,
      height: selectionRectEndPoint.y - selectionRectStartPoint.y,
    }
    selectionRect.size({
      width: selectionRectSize.width * zoomRatio,
      height: selectionRectSize.height * zoomRatio,
    })
    const imageDataRect = {
      x: Math.round(selectionRectStartPoint.x * hitCanvasPixelRatio),
      y: Math.round(selectionRectStartPoint.y * hitCanvasPixelRatio),
      width: Math.ceil(Math.max(Math.abs(selectionRectSize.width * hitCanvasPixelRatio), 1)) * Math.sign(1 / selectionRectSize.width),
      height: Math.ceil(Math.max(Math.abs(selectionRectSize.height * hitCanvasPixelRatio), 1)) * Math.sign(1 / selectionRectSize.height),
    }
    const selectedObjectIds = objectHitCanvasesRef.current.filter(({ selected, canvas, offset }) => {
      if (!imageDataRect.width || !imageDataRect.height) return selected
      const context = canvas.getContext()
      const imageData = context.getImageData(imageDataRect.x - offset.x, imageDataRect.y - offset.y, imageDataRect.width, imageDataRect.height)
      const isObjectInSelectionRect = new Uint32Array(imageData.data.buffer).some(pixel => pixel !== 0)
      return multiselect ? isObjectInSelectionRect !== selected : isObjectInSelectionRect || selected
    }).map(({ id }) => id)
    selectObjects(selectedObjectIds)
  }, [zoomRatio, selectionRectStartPoint, selectObjects])
  const handleWindowPointerUp = useCallback((): void => {
    if (!selectionRectStartPoint) return
    setSelectionRectStartPoint(null)
  }, [selectionRectStartPoint])

  useEffect(() => {
    if (selectionRectStartPoint) {
      window.addEventListener('pointermove', handleWindowPointerMove)
      window.addEventListener('pointerup', handleWindowPointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }
  }, [selectionRectStartPoint, handleWindowPointerMove, handleWindowPointerUp])

  // 选择图形
  const [selectedObjectOnPointerDown, setSelectedObjectOnPointerDown] = useState<boolean>(false)

  const handleStageTap = useCallback((): void => {
    selectObjects([])
  }, [selectObjects])

  const handleObjectPointerDown = useCallback((id: string, event: Konva.KonvaEventObject<PointerEvent>): void => {
    const multiselect = event.evt.shiftKey || event.evt.ctrlKey
    setSelectedObjectOnPointerDown(false)
    if (selectedObjectIds.includes(id)) return
    if (multiselect) {
      selectObjects([...selectedObjectIds, id])
    } else {
      selectObjects([id])
    }
    setSelectedObjectOnPointerDown(true)
  }, [selectedObjectIds, selectObjects])
  const handleObjectPointerClick = useCallback((id: string, event: Konva.KonvaEventObject<PointerEvent>): void => {
    const multiselect = event.evt.shiftKey || event.evt.ctrlKey
    setSelectedObjectOnPointerDown(false)
    if (selectedObjectOnPointerDown) return
    if (event.evt.button === 2) return
    if (multiselect) {
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

  const getPositionsFromDraggingHandle = useCallback((dragHandle: Konva.Node): { id: string, position: { x: number, y: number } }[] | null => {
    const stage = stageRef.current
    const draggingObjects = draggingObjectsRef.current
    const draggingObject = dragHandle.findAncestor('.object')
    if (!stage || !draggingObjects || !draggingObject || !draggingObjects.includes(draggingObject)) return null
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
  const moveObjectsTemporarily = useCallback((dragHandle: Konva.Node, positions: { id: string, position: { x: number, y: number } }[] | null): void => {
    const stage = stageRef.current
    if (!stage) return
    dragHandle.position({ x: 0, y: 0 })
    positions?.forEach(({ id, position }) => {
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
      const draggingObjectIds = scene.objects.filter(object => selectedObjectIds.includes(object.id) && object.visible && !object.locked).map(object => object.id)
      draggingObjectsRef.current = draggingObjectIds.map(id => stageRef.current?.findOne(`.object-${id}`)).filter(canvasObject => !!canvasObject)
    } else {
      selectObjects([id])
      draggingObjectsRef.current = [draggingObject]
    }
  }, [scene, selectedObjectIds, selectObjects])
  const handleObjectDragHandleDragMove = useCallback((dragHandle: Konva.Node): void => {
    const positions = getPositionsFromDraggingHandle(dragHandle)
    moveObjectsTemporarily(dragHandle, positions)
  }, [getPositionsFromDraggingHandle, moveObjectsTemporarily])
  const handleObjectDragHandleDragEnd = useCallback((dragHandle: Konva.Node): void => {
    const positions = getPositionsFromDraggingHandle(dragHandle)
    draggingObjectsRef.current = null
    moveObjectsTemporarily(dragHandle, positions)
    if (positions) moveObjects(positions)
  }, [getPositionsFromDraggingHandle, moveObjectsTemporarily, moveObjects])

  // 移动画布
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

  const handleStageScroll = useCallback((delta: { x: number, y: number }): void => {
    const scrollDistanceRatio = 0.3
    stageRef.current?.move({ x: delta.x * scrollDistanceRatio, y: delta.y * scrollDistanceRatio })
  }, [])

  // 缩放画布
  const handleStageZoomScroll = useCallback((delta: number): void => {
    const zoomLevelRatio = 0.005
    if (delta > 0) zoomOut(delta * zoomLevelRatio)
    if (delta < 0) zoomIn(-delta * zoomLevelRatio)
  }, [zoomIn, zoomOut])

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

  const handlePointerClick = useCallback((event: Konva.KonvaEventObject<PointerEvent>): void => {
    const canvasObject = event.target.findAncestor('.object', true)
    if (canvasObject) {
      const id = canvasObject.getAttr('data-id') as string
      handleObjectPointerClick(id, event)
      return
    }
  }, [handleObjectPointerClick])
  const handleTap = useCallback((event: Konva.KonvaEventObject<TouchEvent>): void => {
    const canvasObject = event.target.findAncestor('.object', true)
    if (canvasObject) {
      return
    }
    const boundingBox = event.target.findAncestor('.object-bounding-box', true)
    if (boundingBox) {
      return
    }
    handleStageTap()
  }, [handleStageTap])

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

  const handleWheel = useCallback((event: Konva.KonvaEventObject<WheelEvent>): void => {
    const deltaRatio = event.evt.deltaMode === 1 || event.evt.deltaMode === 2 ? 100 : 1
    if (event.evt.ctrlKey) {
      event.evt.preventDefault()
      handleStageZoomScroll(event.evt.deltaY * deltaRatio)
      return
    }
    if (event.evt.shiftKey) {
      handleStageScroll({ x: event.evt.deltaY * deltaRatio, y: event.evt.deltaX * deltaRatio })
    } else {
      handleStageScroll({ x: event.evt.deltaX * deltaRatio, y: event.evt.deltaY * deltaRatio })
    }
  }, [handleStageScroll, handleStageZoomScroll])

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
            onPointerClick={handlePointerClick}
            onTap={handleTap}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onWheel={handleWheel}
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
            <Layer listening={false}>
              <Rect
                ref={selectionRectRef}
                x={(selectionRectStartPoint?.x ?? 0) * zoomRatio}
                y={(selectionRectStartPoint?.y ?? 0) * zoomRatio}
                stroke="#fff"
                strokeWidth={1}
                shadowBlur={2}
                fill="rgba(255,255,255,0.2)"
                visible={!!selectionRectStartPoint}
              />
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
  const { canvasSize, setCanvasSize, zoomRatio, setFixedZoomRatio } = useStrategyBoardCanvas()

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
      setFixedZoomRatio(Math.min(stageContainer.offsetWidth / sceneWidth, stageContainer.offsetHeight / sceneHeight))
    })
    resizeObserver.observe(stageContainer)
    return () => resizeObserver.unobserve(stageContainer)
  }, [setCanvasSize, setFixedZoomRatio])

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
