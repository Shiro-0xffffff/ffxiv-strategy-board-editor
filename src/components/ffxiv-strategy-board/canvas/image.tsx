'use client'

import { useRef, useMemo, useCallback } from 'react'
import Konva from 'konva'
import { Group, Line, Rect, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardCommonObject, StrategyBoardMechanicLineStackObject, StrategyBoardMechanicLinearKnockbackObject, StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { sizeToCanvasSize } from './calc'

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
  selected?: boolean
  onResize?: (size: number) => void
  onRotate?: (rotation: number) => void
}

export function ImageCanvasObject(props: ImageCanvasObjectProps) {
  const { object, selected, onResize, onRotate } = props
  const { id, type, locked, size, flipped, rotation, transparency } = object

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

  const imageBaseSize = sizeToCanvasSize({
    width: objectLibraryItem.baseSize,
    height: objectLibraryItem.baseSize,
  })

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>)

  const resizeObject = useCallback((size: number): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(imageBaseSize.width * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x)
      resizeHandle.y(imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y)
    })
    rotateHandleRef.current?.y(-imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxFrameRef.current?.scaleX(size / 100)
    boundingBoxFrameRef.current?.scaleY(size / 100)
    objectRef.current?.scaleX(size / 100)
    objectRef.current?.scaleY(size / 100)
  }, [imageBaseSize.width, imageBaseSize.height, repeat])
  
  const getSizeFromResizeHandle = useCallback((resizeHandle: Konva.Node): number => {
    const x = resizeHandle.x() / (repeat ? repeat.x : 1)
    const y = resizeHandle.y() / (repeat ? repeat.y : 1)
    const size = Math.max(Math.abs(x * 2 / imageBaseSize.width), Math.abs(y * 2 / imageBaseSize.height)) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    return normalizedSize
  }, [imageBaseSize.width, imageBaseSize.height, repeat])

  const handleResizeHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = getSizeFromResizeHandle(event.target)
    resizeObject(size)
  }, [getSizeFromResizeHandle, resizeObject])
  const handleResizeHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = getSizeFromResizeHandle(event.target)
    resizeObject(size)
    onResize?.(size)
  }, [getSizeFromResizeHandle, resizeObject, onResize])

  // 旋转
  const boundingBoxRef = useRef<Konva.Group>(null)
  const rotateHandleRef = useRef<Konva.Rect>(null)
  const rotateHandleConnectionLineRef = useRef<Konva.Line>(null)

  const rotateObject = useCallback((rotation: number): void => {
    rotateHandleRef.current?.x(0)
    rotateHandleRef.current?.y(-imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [imageBaseSize.height, repeat, size])
  
  const getRotationFromRotateHandle = useCallback((rotateHandle: Konva.Node): number => {
    const rotation = (boundingBoxRef.current?.rotation() ?? 0) + Math.atan2(rotateHandle.x(), -rotateHandle.y()) * 180 / Math.PI
    const normalizedRotation = Math.round(rotation % 360)
    return normalizedRotation
  }, [])

  const handleRotateHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const rotation = getRotationFromRotateHandle(event.target)
    rotateObject(rotation)
  }, [getRotationFromRotateHandle, rotateObject])
  const handleRotateHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const rotation = getRotationFromRotateHandle(event.target)
    rotateObject(rotation)
    onRotate?.(rotation)
  }, [getRotationFromRotateHandle, rotateObject, onRotate])

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
            offsetX={imageBaseSize.width * repeat.x / 2}
            offsetY={imageBaseSize.height * repeat.y / 2}
            width={imageBaseSize.width * repeat.x}
            height={imageBaseSize.height * repeat.y}
            fillPatternImage={backgroundImage}
            fillPatternScaleX={backgroundImage?.width ? imageBaseSize.width / backgroundImage.width : 1}
            fillPatternScaleY={backgroundImage?.height ? imageBaseSize.height / backgroundImage.height : 1}
            scaleX={flipped ? -1 : 1}
          />
        ) : (
          <Image
            offsetX={imageBaseSize.width / 2}
            offsetY={imageBaseSize.height / 2}
            width={imageBaseSize.width}
            height={imageBaseSize.height}
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
              offsetX={imageBaseSize.width * (repeat ? repeat.x : 1) / 2}
              offsetY={imageBaseSize.height * (repeat ? repeat.y : 1) / 2}
              width={imageBaseSize.width * (repeat ? repeat.x : 1)}
              height={imageBaseSize.height * (repeat ? repeat.y : 1)}
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
                  y={-imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={imageBaseSize.width * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x}
                    y={imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y}
                    offsetX={resizeHandleSize / 2}
                    offsetY={resizeHandleSize / 2}
                    width={resizeHandleSize}
                    height={resizeHandleSize}
                    stroke="#fff"
                    strokeWidth={2}
                    shadowBlur={4}
                    fill="#fff"
                    draggable
                    onDragMove={handleResizeHandleDragMove}
                    onDragEnd={handleResizeHandleDragEnd}
                  />
                ))}
                <Rect
                  ref={rotateHandleRef}
                  y={-imageBaseSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
                  offsetX={rotateHandleSize / 2}
                  offsetY={rotateHandleSize / 2}
                  width={rotateHandleSize}
                  height={rotateHandleSize}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                  cornerRadius={Infinity}
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
