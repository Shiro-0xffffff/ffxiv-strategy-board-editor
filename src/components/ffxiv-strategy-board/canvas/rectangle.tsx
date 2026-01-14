'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Line, Rect } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardRectangleObject } from '@/lib/ffxiv-strategy-board'

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
  zoomRatio?: number
  selected?: boolean
  onResize?: (size: { width: number, height: number }) => void
  onRotate?: (rotation: number) => void
}

export function RectangleCanvasObject(props: RectangleCanvasObjectProps) {
  const { object, zoomRatio = 1, selected, onResize, onRotate } = props
  const { id, locked, size, rotation, transparency, color } = object

  const objectRef = useRef<Konva.Rect>(null)

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>)

  const resizeObject = useCallback((size: { width: number, height: number }): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(size.width * zoomRatio / 2 * direction.x)
      resizeHandle.y(size.height * zoomRatio / 2 * direction.y)
    })
    rotateHandleRef.current?.y(-size.height * zoomRatio / 2 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-size.height * zoomRatio / 2 - rotateHandleOffset)
    boundingBoxFrameRef.current?.offsetX(size.width * zoomRatio / 2)
    boundingBoxFrameRef.current?.offsetY(size.height * zoomRatio / 2)
    boundingBoxFrameRef.current?.width(size.width * zoomRatio)
    boundingBoxFrameRef.current?.height(size.height * zoomRatio)
    objectRef.current?.offsetX(size.width * zoomRatio / 2)
    objectRef.current?.offsetY(size.height * zoomRatio / 2)
    objectRef.current?.width(size.width * zoomRatio)
    objectRef.current?.height(size.height * zoomRatio)
  }, [zoomRatio])

  const getSizeFromResizeHandle = useCallback((resizeHandle: Konva.Node): { width: number, height: number } => {
    const [resizeHandleId] = resizeHandlesRef.current.entries().find(([, node]) => node === resizeHandle)!
    const direction = resizeDirections.get(resizeHandleId)!
    const width = Math.abs(resizeHandle.x() * 2 / zoomRatio / direction.x)
    const height = Math.abs(resizeHandle.y() * 2 / zoomRatio / direction.y)
    const normalizedSize = {
      width: direction.x ? Math.round(Math.min(Math.max(width, 0), 12800)) : boundingBoxFrameRef.current!.width() / zoomRatio,
      height: direction.y ? Math.round(Math.min(Math.max(height, 0), 12800)) : boundingBoxFrameRef.current!.height() / zoomRatio,
    }
    return normalizedSize
  }, [zoomRatio])

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
    rotateHandleRef.current?.y(-size.height * zoomRatio / 2 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [size.height, zoomRatio])

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
        offsetX={size.width * zoomRatio / 2}
        offsetY={size.height * zoomRatio / 2}
        width={size.width * zoomRatio}
        height={size.height * zoomRatio}
        fill={color}
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
              offsetX={size.width * zoomRatio / 2}
              offsetY={size.height * zoomRatio / 2}
              width={size.width * zoomRatio}
              height={size.height * zoomRatio}
              stroke="#fff"
              strokeWidth={2}
              shadowBlur={4}
              listening={false}
            />
            {!locked && (
              <>
                <Line
                  ref={rotateHandleConnectionLineRef}
                  y={-size.height * zoomRatio / 2 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={size.width * zoomRatio / 2 * direction.x}
                    y={size.height * zoomRatio / 2 * direction.y}
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
                  x={0}
                  y={-size.height * zoomRatio / 2 - rotateHandleOffset}
                  offsetX={rotateHandleSize / 2}
                  offsetY={rotateHandleSize / 2}
                  width={rotateHandleSize}
                  height={rotateHandleSize}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                  cornerRadius={rotateHandleSize}
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
