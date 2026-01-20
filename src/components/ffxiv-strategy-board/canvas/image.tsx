'use client'

import { useRef, useMemo, useCallback } from 'react'
import Konva from 'konva'
import { Group, Line, Rect, Circle, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardCommonObject, StrategyBoardMechanicLineStackObject, StrategyBoardMechanicLinearKnockbackObject, StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { useStrategyBoardCanvas } from './context'

const resizeHandleSize = 6
const rotateHandleSize = 8
const rotateHandleOffset = 24

const resizeDirections = new Map<string, { x: -1 | 0 | 1, y: -1 | 0 | 1 }>([
  ['right', { x: 1, y: 0 }],
  ['bottom', { x: 0, y: 1 }],
  ['left', { x: -1, y: 0 }],
  ['top', { x: 0, y: -1 }],
  ['top-left', { x: -1, y: -1 }],
  ['bottom-left', { x: -1, y: 1 }],
  ['bottom-right', { x: 1, y: 1 }],
  ['top-right', { x: 1, y: -1 }],
])

export interface ImageCanvasObjectProps {
  object: StrategyBoardCommonObject | StrategyBoardMechanicLineStackObject | StrategyBoardMechanicLinearKnockbackObject
}

export function ImageCanvasObject(props: ImageCanvasObjectProps) {
  const { object } = props
  const { id, type, locked, size, flipped, rotation, transparency } = object

  const { zoomRatio, isObjectSelected, resizeObject, rotateObject } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const repeat: { x: number, y: number } | null = useMemo(() => {
    if (object.type === StrategyBoardObjectType.MechanicLineStack) {
      return { x: 1, y: object.displayCount }
    }
    if (object.type === StrategyBoardObjectType.MechanicLinearKnockback) {
      return { x: object.displayCount.horizontal, y: object.displayCount.vertical }
    }
    return null
  }, [object])

  const objectLibraryItem = objectLibrary.get(type)!

  const objectRef = useRef<Konva.Group>(null)

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const imageBaseCanvasSize = {
    width: objectLibraryItem.baseSize * zoomRatio,
    height: objectLibraryItem.baseSize * zoomRatio,
  }

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>())

  const resizeObjectTemporarily = useCallback((size: number): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(imageBaseCanvasSize.width * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x)
      resizeHandle.y(imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y)
    })
    rotateHandleRef.current?.y(-imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxFrameRef.current?.scaleX(size / 100)
    boundingBoxFrameRef.current?.scaleY(size / 100)
    objectRef.current?.scaleX(size / 100)
    objectRef.current?.scaleY(size / 100)
  }, [imageBaseCanvasSize.width, imageBaseCanvasSize.height, repeat])

  const getSizeFromResizeHandle = useCallback((resizeHandle: Konva.Node): number => {
    const x = resizeHandle.x() / (repeat ? repeat.x : 1)
    const y = resizeHandle.y() / (repeat ? repeat.y : 1)
    const size = Math.max(Math.abs(x * 2 / imageBaseCanvasSize.width), Math.abs(y * 2 / imageBaseCanvasSize.height)) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    return normalizedSize
  }, [imageBaseCanvasSize.width, imageBaseCanvasSize.height, repeat])

  const handleResizeHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = getSizeFromResizeHandle(event.target)
    resizeObjectTemporarily(size)
  }, [getSizeFromResizeHandle, resizeObjectTemporarily])
  const handleResizeHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = getSizeFromResizeHandle(event.target)
    resizeObjectTemporarily(size)
    resizeObject(id, size)
  }, [getSizeFromResizeHandle, resizeObjectTemporarily, id, resizeObject])

  // 旋转
  const boundingBoxRef = useRef<Konva.Group>(null)
  const rotateHandleRef = useRef<Konva.Circle>(null)
  const rotateHandleConnectionLineRef = useRef<Konva.Line>(null)

  const rotateObjectTemporarily = useCallback((rotation: number): void => {
    rotateHandleRef.current?.x(0)
    rotateHandleRef.current?.y(-imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [imageBaseCanvasSize.height, repeat, size])

  const getRotationFromRotateHandle = useCallback((rotateHandle: Konva.Node): number => {
    const rotation = (boundingBoxRef.current?.rotation() ?? 0) + Math.atan2(rotateHandle.x(), -rotateHandle.y()) * 180 / Math.PI
    const normalizedRotation = Math.round(rotation % 360)
    return normalizedRotation
  }, [])

  const handleRotateHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const rotation = getRotationFromRotateHandle(event.target)
    rotateObjectTemporarily(rotation)
  }, [getRotationFromRotateHandle, rotateObjectTemporarily])
  const handleRotateHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const rotation = getRotationFromRotateHandle(event.target)
    rotateObjectTemporarily(rotation)
    rotateObject(id, rotation)
  }, [getRotationFromRotateHandle, rotateObjectTemporarily, id, rotateObject])

  return (
    <>
      <Group
        ref={objectRef}
        opacity={1 - transparency / 100}
        scaleX={size / 100}
        scaleY={size / 100}
        rotation={rotation}
      >
        {repeat ? (
          <Rect
            offsetX={imageBaseCanvasSize.width * repeat.x / 2}
            offsetY={imageBaseCanvasSize.height * repeat.y / 2}
            width={imageBaseCanvasSize.width * repeat.x}
            height={imageBaseCanvasSize.height * repeat.y}
            fillPatternImage={backgroundImage}
            fillPatternScaleX={backgroundImage?.width ? imageBaseCanvasSize.width / backgroundImage.width : 1}
            fillPatternScaleY={backgroundImage?.height ? imageBaseCanvasSize.height / backgroundImage.height : 1}
            scaleX={flipped ? -1 : 1}
          />
        ) : (
          <Image
            offsetX={imageBaseCanvasSize.width / 2}
            offsetY={imageBaseCanvasSize.height / 2}
            width={imageBaseCanvasSize.width}
            height={imageBaseCanvasSize.height}
            image={backgroundImage}
            alt={objectLibraryItem.abbr}
            scaleX={flipped ? -1 : 1}
          />
        )}
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group
            ref={boundingBoxRef}
            rotation={rotation}
          >
            <Rect
              ref={boundingBoxFrameRef}
              offsetX={imageBaseCanvasSize.width * (repeat ? repeat.x : 1) / 2}
              offsetY={imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2}
              width={imageBaseCanvasSize.width * (repeat ? repeat.x : 1)}
              height={imageBaseCanvasSize.height * (repeat ? repeat.y : 1)}
              stroke="#fff"
              strokeWidth={2}
              shadowBlur={4}
              scaleX={size / 100}
              scaleY={size / 100}
              strokeScaleEnabled={false}
              listening={false}
            />
            {!locked && (
              <>
                <Line
                  ref={rotateHandleConnectionLineRef}
                  y={-imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={imageBaseCanvasSize.width * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x}
                    y={imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y}
                    offsetX={resizeHandleSize / 2}
                    offsetY={resizeHandleSize / 2}
                    width={resizeHandleSize}
                    height={resizeHandleSize}
                    stroke="#fff"
                    strokeWidth={2}
                    hitStrokeWidth={8}
                    shadowBlur={4}
                    fill="#fff"
                    draggable
                    onDragMove={handleResizeHandleDragMove}
                    onDragEnd={handleResizeHandleDragEnd}
                  />
                ))}
                <Circle
                  ref={rotateHandleRef}
                  x={0}
                  y={-imageBaseCanvasSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
                  radius={rotateHandleSize / 2}
                  stroke="#fff"
                  strokeWidth={2}
                  hitStrokeWidth={8}
                  shadowBlur={4}
                  fill="#fff"
                  draggable
                  onDragMove={handleRotateHandleDragMove}
                  onDragEnd={handleRotateHandleDragEnd}
                />
              </>
            )}
          </Group>
        </Portal>
      )}
    </>
  )
}
