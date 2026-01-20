'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Line, Rect, Circle } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardRectangleObject } from '@/lib/ffxiv-strategy-board'

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

export interface RectangleCanvasObjectProps {
  object: StrategyBoardRectangleObject
}

export function RectangleCanvasObject(props: RectangleCanvasObjectProps) {
  const { object } = props
  const { id, locked, size, rotation, transparency, color } = object

  const { zoomRatio, isObjectSelected, resizeObject, rotateObject } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const objectRef = useRef<Konva.Rect>(null)

  const canvasSize = {
    width: size.width * zoomRatio,
    height: size.height * zoomRatio,
  }

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>())

  const resizeObjectTemporarily = useCallback((size: { width: number, height: number }): void => {
    const canvasSize = {
      width: size.width * zoomRatio,
      height: size.height * zoomRatio,
    }
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(canvasSize.width / 2 * direction.x)
      resizeHandle.y(canvasSize.height / 2 * direction.y)
    })
    rotateHandleRef.current?.y(-canvasSize.height / 2 - rotateHandleOffset)
    rotateHandleConnectionLineRef.current?.y(-canvasSize.height / 2 - rotateHandleOffset)
    boundingBoxFrameRef.current?.offsetX(canvasSize.width / 2)
    boundingBoxFrameRef.current?.offsetY(canvasSize.height / 2)
    boundingBoxFrameRef.current?.width(canvasSize.width)
    boundingBoxFrameRef.current?.height(canvasSize.height)
    objectRef.current?.offsetX(canvasSize.width / 2)
    objectRef.current?.offsetY(canvasSize.height / 2)
    objectRef.current?.width(canvasSize.width)
    objectRef.current?.height(canvasSize.height)
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
    rotateHandleRef.current?.y(-canvasSize.height / 2 - rotateHandleOffset)
    boundingBoxRef.current?.rotation(rotation)
    objectRef.current?.rotation(rotation)
  }, [canvasSize.height])

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
      <Rect
        ref={objectRef}
        offsetX={canvasSize.width / 2}
        offsetY={canvasSize.height / 2}
        width={canvasSize.width}
        height={canvasSize.height}
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
              offsetX={canvasSize.width / 2}
              offsetY={canvasSize.height / 2}
              width={canvasSize.width}
              height={canvasSize.height}
              stroke="#fff"
              strokeWidth={2}
              shadowBlur={4}
              listening={false}
            />
            {!locked && (
              <>
                <Line
                  ref={rotateHandleConnectionLineRef}
                  y={-canvasSize.height / 2 - rotateHandleOffset}
                  points={[0, 0, 0, rotateHandleOffset]}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                />
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={canvasSize.width / 2 * direction.x}
                    y={canvasSize.height / 2 * direction.y}
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
                  y={-canvasSize.height / 2 - rotateHandleOffset}
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
