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

  const imageSize = sizeToCanvasSize({
    width: objectLibraryItem.baseSize,
    height: objectLibraryItem.baseSize,
  })

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>)

  const resizeObject = useCallback((size: number): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(imageSize.width * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x)
      resizeHandle.y(imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y)
    })
    rotateHandleRef.current?.y(-imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxFrameRef.current?.scaleX(size / 100)
    boundingBoxFrameRef.current?.scaleY(size / 100)
    objectRef.current?.scaleX(size / 100)
    objectRef.current?.scaleY(size / 100)
  }, [imageSize.width, imageSize.height, repeat])

  const handleResizeHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const x = event.target.x() / (repeat ? repeat.x : 1)
    const y = event.target.y() / (repeat ? repeat.y : 1)
    const size = Math.max(Math.abs(x * 2 / imageSize.width), Math.abs(y * 2 / imageSize.height)) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    resizeObject(normalizedSize)
  }, [resizeObject, imageSize.width, imageSize.height, repeat])
  const handleResizeHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const x = event.target.x() / (repeat ? repeat.x : 1)
    const y = event.target.y() / (repeat ? repeat.y : 1)
    const size = Math.max(Math.abs(x * 2 / imageSize.width), Math.abs(y * 2 / imageSize.height)) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    resizeObject(normalizedSize)
    onResize?.(normalizedSize)
  }, [resizeObject, imageSize.width, imageSize.height, repeat, onResize])

  // 旋转
  const boundingBoxRef = useRef<Konva.Group>(null)
  const rotateHandleRef = useRef<Konva.Rect>(null)
  const rotateHandleConnectionLineRef = useRef<Konva.Line>(null)

  const rotateObject = useCallback((rotation: number): void => {
    rotateHandleRef.current?.x(0)
    rotateHandleRef.current?.y(-imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [imageSize.height, repeat, size])

  const handleRotateHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const rotation = (boundingBoxRef.current?.rotation() ?? 0) + Math.atan2(event.target.x(), -event.target.y()) * 180 / Math.PI
    const normalizedRotation = Math.round(rotation % 360)
    rotateObject(normalizedRotation)
  }, [rotateObject])
  const handleRotateHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const rotation = (boundingBoxRef.current?.rotation() ?? 0) + Math.atan2(event.target.x(), -event.target.y()) * 180 / Math.PI
    const normalizedRotation = Math.round(rotation % 360)
    rotateObject(normalizedRotation)
    onRotate?.(normalizedRotation)
  }, [rotateObject, onRotate])

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
            offsetX={imageSize.width * repeat.x / 2}
            offsetY={imageSize.height * repeat.y / 2}
            width={imageSize.width * repeat.x}
            height={imageSize.height * repeat.y}
            fillPatternImage={backgroundImage}
            fillPatternScaleX={backgroundImage?.width ? imageSize.width / backgroundImage.width : 1}
            fillPatternScaleY={backgroundImage?.height ? imageSize.height / backgroundImage.height : 1}
            scaleX={flipped ? -1 : 1}
          />
        ) : (
          <Image
            offsetX={imageSize.width / 2}
            offsetY={imageSize.height / 2}
            width={imageSize.width}
            height={imageSize.height}
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
              offsetX={imageSize.width * (repeat ? repeat.x : 1) / 2}
              offsetY={imageSize.height * (repeat ? repeat.y : 1) / 2}
              width={imageSize.width * (repeat ? repeat.x : 1)}
              height={imageSize.height * (repeat ? repeat.y : 1)}
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
                  y={-imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={imageSize.width * (repeat ? repeat.x : 1) / 2 * size / 100 * direction.x}
                    y={imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 * direction.y}
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
                  y={-imageSize.height * (repeat ? repeat.y : 1) / 2 * size / 100 - rotateHandleOffset}
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
