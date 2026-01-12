'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Line, Rect } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardRectangleObject } from '@/lib/ffxiv-strategy-board'

import { sizeToCanvasSize, colorToCanvasColor } from './calc'

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

export interface RectangleCanvasObjectProps {
  object: StrategyBoardRectangleObject
  selected?: boolean
  onResize?: (size: { width: number, height: number }) => void
  onRotate?: (rotation: number) => void
}

export function RectangleCanvasObject(props: RectangleCanvasObjectProps) {
  const { object, selected, onResize, onRotate } = props
  const { id, locked, size, rotation, transparency, color } = object

  const objectRef = useRef<Konva.Rect>(null)

  const rectBaseSize = sizeToCanvasSize({ width: 1, height: 1 })
  const rectColor = colorToCanvasColor(color)

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>)

  const resizeObject = useCallback((size: { width: number, height: number }): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(rectBaseSize.width * size.width / 2 * direction.x)
      resizeHandle.y(rectBaseSize.height * size.height / 2 * direction.y)
    })
    rotateHandleRef.current?.y(-rectBaseSize.height * size.height / 2 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-rectBaseSize.height * size.height / 2 - rotateHandleOffset)
    boundingBoxFrameRef.current?.offsetX(rectBaseSize.width * size.width / 2)
    boundingBoxFrameRef.current?.offsetY(rectBaseSize.height * size.height / 2)
    boundingBoxFrameRef.current?.width(rectBaseSize.width * size.width)
    boundingBoxFrameRef.current?.height(rectBaseSize.height * size.height)
    objectRef.current?.offsetX(rectBaseSize.width * size.width / 2)
    objectRef.current?.offsetY(rectBaseSize.height * size.height / 2)
    objectRef.current?.width(rectBaseSize.width * size.width)
    objectRef.current?.height(rectBaseSize.height * size.height)
  }, [rectBaseSize.width, rectBaseSize.height])

  const getSizeFromResizeHandle = useCallback((resizeHandle: Konva.Node): { width: number, height: number } => {
    const [resizeHandleId] = resizeHandlesRef.current.entries().find(([, node]) => node === resizeHandle)!
    const direction = resizeDirections.get(resizeHandleId)!
    const width = Math.abs(resizeHandle.x() * 2 / rectBaseSize.width / direction.x)
    const height = Math.abs(resizeHandle.y() * 2 / rectBaseSize.height / direction.y)
    const normalizedSize = {
      width: direction.x ? Math.round(Math.min(Math.max(width, 0), 12800)) : boundingBoxFrameRef.current!.width() / rectBaseSize.width,
      height: direction.y ? Math.round(Math.min(Math.max(height, 0), 12800)) : boundingBoxFrameRef.current!.height() / rectBaseSize.height,
    }
    return normalizedSize
  }, [rectBaseSize.width, rectBaseSize.height])

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
    rotateHandleRef.current?.y(-rectBaseSize.height * size.height / 2 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [rectBaseSize.height, size.height])

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
      <Rect
        ref={objectRef}
        offsetX={rectBaseSize.width * size.width / 2}
        offsetY={rectBaseSize.height * size.height / 2}
        width={rectBaseSize.width * size.width}
        height={rectBaseSize.height * size.height}
        fill={rectColor}
        opacity={1 - transparency / 100}
        rotation={rotation}
      />
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group
            ref={boundingBoxRef}
            rotation={rotation}
          >
            <Rect
              ref={boundingBoxFrameRef}
              offsetX={rectBaseSize.width * size.width / 2}
              offsetY={rectBaseSize.height * size.height / 2}
              width={rectBaseSize.width * size.width}
              height={rectBaseSize.height * size.height}
              stroke="#fff"
              strokeWidth={2}
              shadowBlur={4}
              strokeScaleEnabled={false}
              listening={false}
            />
            {!locked && (
              <>
                <Line
                  ref={rotateHandleConnectionLineRef}
                  y={-rectBaseSize.height * size.height / 2 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={rectBaseSize.width * size.width / 2 * direction.x}
                    y={rectBaseSize.height * size.height / 2 * direction.y}
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
                  y={-rectBaseSize.height * size.height / 2 - rotateHandleOffset}
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
