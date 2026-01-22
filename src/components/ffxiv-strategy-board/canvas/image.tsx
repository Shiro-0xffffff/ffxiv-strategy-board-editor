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

const squareResizeDirections = new Map<string, { x: -1 | 0 | 1, y: -1 | 0 | 1 }>([
  ['square-right', { x: 1, y: 0 }],
  ['square-bottom', { x: 0, y: 1 }],
  ['square-left', { x: -1, y: 0 }],
  ['square-top', { x: 0, y: -1 }],
  ['square-top-left', { x: -1, y: -1 }],
  ['square-bottom-left', { x: -1, y: 1 }],
  ['square-bottom-right', { x: 1, y: 1 }],
  ['square-top-right', { x: 1, y: -1 }],
])
const roundResizeDirections = new Map<string, { x: -1 | 0 | 1, y: -1 | 0 | 1 }>([
  ['round-right', { x: 1, y: 0 }],
  ['round-bottom', { x: 0, y: 1 }],
  ['round-left', { x: -1, y: 0 }],
  ['round-top', { x: 0, y: -1 }],
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

  const imageBaseCanvasSize = objectLibraryItem.baseSize * zoomRatio

  // 缩放
  const squareBoundingBoxFrameRef = useRef<Konva.Rect>(null)
  const roundBoundingBoxFrameRef = useRef<Konva.Circle>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>())

  const resizeObjectTemporarily = useCallback((size: number): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = squareResizeDirections.get(id) ?? roundResizeDirections.get(id)
      if (!direction) return
      resizeHandle.x(imageBaseCanvasSize * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x)
      resizeHandle.y(imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y)
    })
    rotateHandleRef.current?.y(-imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    squareBoundingBoxFrameRef.current?.scaleX(size / 100)
    roundBoundingBoxFrameRef.current?.scaleX(size / 100)
    squareBoundingBoxFrameRef.current?.scaleY(size / 100)
    roundBoundingBoxFrameRef.current?.scaleY(size / 100)
    objectRef.current?.scaleX(size / 100)
    objectRef.current?.scaleY(size / 100)
  }, [imageBaseCanvasSize, repeat])

  const getSizeFromResizeHandle = useCallback((resizeHandle: Konva.Node): number => {
    const x = resizeHandle.x() / (repeat ? repeat.x : 1)
    const y = resizeHandle.y() / (repeat ? repeat.y : 1)
    const size = Math.max(Math.abs(x * 2 / imageBaseCanvasSize), Math.abs(y * 2 / imageBaseCanvasSize)) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    return normalizedSize
  }, [imageBaseCanvasSize, repeat])

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
    rotateHandleRef.current?.y(-imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [imageBaseCanvasSize, repeat, size])

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
        {...objectLibraryItem.shape === 'round' && !repeat && {
          clipFunc: ctx => {
            ctx.beginPath()
            ctx.moveTo(imageBaseCanvasSize / 2, 0)
            ctx.arc(0, 0, imageBaseCanvasSize / 2, 0, Math.PI * 2)
          }
        }}
        opacity={1 - transparency / 100}
        scaleX={size / 100}
        scaleY={size / 100}
        rotation={rotation}
      >
        {repeat ? (
          <Rect
            offsetX={imageBaseCanvasSize * repeat.x / 2}
            offsetY={imageBaseCanvasSize * repeat.y / 2}
            width={imageBaseCanvasSize * repeat.x}
            height={imageBaseCanvasSize * repeat.y}
            fillPatternImage={backgroundImage}
            fillPatternScaleX={backgroundImage?.width ? imageBaseCanvasSize / backgroundImage.width : 1}
            fillPatternScaleY={backgroundImage?.height ? imageBaseCanvasSize / backgroundImage.height : 1}
            scaleX={flipped ? -1 : 1}
          />
        ) : (
          <Image
            offsetX={imageBaseCanvasSize / 2}
            offsetY={imageBaseCanvasSize / 2}
            width={imageBaseCanvasSize}
            height={imageBaseCanvasSize}
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
            {objectLibraryItem.shape === 'round' && !repeat ? (
              <Circle
                ref={roundBoundingBoxFrameRef}
                radius={imageBaseCanvasSize / 2}
                stroke="#fff"
                strokeWidth={2}
                shadowBlur={4}
                scaleX={size / 100}
                scaleY={size / 100}
                strokeScaleEnabled={false}
                listening={false}
              />
            ) : (
              <Rect
                ref={squareBoundingBoxFrameRef}
                offsetX={imageBaseCanvasSize * (repeat ? repeat.x : 1) / 2}
                offsetY={imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2}
                width={imageBaseCanvasSize * (repeat ? repeat.x : 1)}
                height={imageBaseCanvasSize * (repeat ? repeat.y : 1)}
                stroke="#fff"
                strokeWidth={2}
                shadowBlur={4}
                scaleX={size / 100}
                scaleY={size / 100}
                strokeScaleEnabled={false}
                listening={false}
              />
            )}
            {!locked && (
              <>
                <Line
                  ref={rotateHandleConnectionLineRef}
                  y={-imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...(objectLibraryItem.shape === 'round' && !repeat ? roundResizeDirections : squareResizeDirections).entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={imageBaseCanvasSize * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x}
                    y={imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y}
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
                  y={-imageBaseCanvasSize * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
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
