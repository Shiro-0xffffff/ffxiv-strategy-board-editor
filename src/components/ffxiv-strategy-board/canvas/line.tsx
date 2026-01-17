'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardLineObject } from '@/lib/ffxiv-strategy-board'

import { useStrategyBoardCanvas } from './context'

const endPointHandleSize = 8

export interface LineCanvasObjectProps {
  object: StrategyBoardLineObject
}

export function LineCanvasObject(props: LineCanvasObjectProps) {
  const { object } = props
  const { id, locked, endPointOffset, lineWidth, transparency, color } = object

  const { zoomRatio, isObjectSelected, moveEndPoints } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const objectRef = useRef<Konva.Rect>(null)

  const lineCanvasWidth = lineWidth * zoomRatio
  const lineCanvasLength = Math.hypot(endPointOffset.x, endPointOffset.y) * zoomRatio * 2
  const rotation = Math.atan2(endPointOffset.y, endPointOffset.x) * 180 / Math.PI
  const endPointCanvasOffset = {
    x: endPointOffset.x * zoomRatio,
    y: endPointOffset.y * zoomRatio,
  }

  // 移动端点
  const boundingBoxRef = useRef<Konva.Group>(null)
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const endPoint1HandleRef = useRef<Konva.Rect>(null)
  const endPoint2HandleRef = useRef<Konva.Rect>(null)

  const moveEndPointsTemporarily = useCallback((endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }): void => {
    const endPointCanvasOffset = {
      x: (endPoint2.x - endPoint1.x) / 2 * zoomRatio,
      y: (endPoint2.y - endPoint1.y) / 2 * zoomRatio,
    }
    const positionCanvasOffset = {
      x: (endPoint1.x + endPoint2.x) / 2 * zoomRatio,
      y: (endPoint1.y + endPoint2.y) / 2 * zoomRatio,
    }
    const lineCanvasLength = Math.hypot(endPoint2.x - endPoint1.x, endPoint2.y - endPoint1.y) * zoomRatio
    const rotation = Math.atan2(endPoint2.y - endPoint1.y, endPoint2.x - endPoint1.x) * 180 / Math.PI

    endPoint1HandleRef.current?.x(-endPointCanvasOffset.x)
    endPoint1HandleRef.current?.y(-endPointCanvasOffset.y)
    endPoint2HandleRef.current?.x(endPointCanvasOffset.x)
    endPoint2HandleRef.current?.y(endPointCanvasOffset.y)
    boundingBoxFrameRef.current?.findAncestor('.object-bounding-box')?.position(positionCanvasOffset)
    boundingBoxFrameRef.current?.offsetX(lineCanvasLength / 2)
    boundingBoxFrameRef.current?.width(lineCanvasLength)
    boundingBoxFrameRef.current?.rotation(rotation)
    objectRef.current?.findAncestor('.object')?.position(positionCanvasOffset)
    objectRef.current?.offsetX(lineCanvasLength / 2)
    objectRef.current?.width(lineCanvasLength)
    objectRef.current?.rotation(rotation)
  }, [zoomRatio])

  const getEndPointsFromEndPointHandle = useCallback((endPoint1Handle: Konva.Node | null, endPoint2Handle: Konva.Node | null): [{ x: number, y: number }, { x: number, y: number }] => {
    const endPoint1 = endPoint1Handle?.position() ?? endPoint1HandleRef.current!.position()
    const endPoint2 = endPoint2Handle?.position() ?? endPoint2HandleRef.current!.position()
    const positionOffset = boundingBoxFrameRef.current?.findAncestor('.object-bounding-box')?.position() ?? { x: 0, y: 0 }
    const normalizedEndPoint1 = {
      x: Math.round((endPoint1.x + positionOffset.x) / zoomRatio),
      y: Math.round((endPoint1.y + positionOffset.y) / zoomRatio),
    }
    const normalizedEndPoint2 = {
      x: Math.round((endPoint2.x + positionOffset.x) / zoomRatio),
      y: Math.round((endPoint2.y + positionOffset.y) / zoomRatio),
    }
    return [normalizedEndPoint1, normalizedEndPoint2]
  }, [zoomRatio])

  const handleEndPoint1HandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(event.target, null)
    moveEndPointsTemporarily(endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPointsTemporarily])
  const handleEndPoint2HandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(null, event.target)
    moveEndPointsTemporarily(endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPointsTemporarily])
  const handleEndPoint1HandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(event.target, null)
    moveEndPointsTemporarily(endPoint1, endPoint2)
    moveEndPoints(id, endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPointsTemporarily, id, moveEndPoints])
  const handleEndPoint2HandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(null, event.target)
    moveEndPointsTemporarily(endPoint1, endPoint2)
    moveEndPoints(id, endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPointsTemporarily, id, moveEndPoints])

  return (
    <>
      <Rect
        ref={objectRef}
        offsetX={lineCanvasLength / 2}
        offsetY={lineCanvasWidth / 2}
        width={lineCanvasLength}
        height={lineCanvasWidth}
        fill={color}
        opacity={1 - transparency / 100}
        rotation={rotation}
      />
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group
            ref={boundingBoxRef}
          >
            <Rect
              ref={boundingBoxFrameRef}
              offsetX={lineCanvasLength / 2}
              offsetY={lineCanvasWidth / 2}
              width={lineCanvasLength}
              height={lineCanvasWidth}
              stroke="#fff"
              strokeWidth={2}
              shadowBlur={4}
              rotation={rotation}
              listening={false}
            />
            {!locked && (
              <>
                <Rect
                  ref={endPoint1HandleRef}
                  x={-endPointCanvasOffset.x}
                  y={-endPointCanvasOffset.y}
                  offsetX={endPointHandleSize / 2}
                  offsetY={endPointHandleSize / 2}
                  width={endPointHandleSize}
                  height={endPointHandleSize}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                  cornerRadius={endPointHandleSize}
                  fill="#fff"
                  draggable
                  onDragMove={handleEndPoint1HandleDragMove}
                  onDragEnd={handleEndPoint1HandleDragEnd}
                />
                <Rect
                  ref={endPoint2HandleRef}
                  x={endPointCanvasOffset.x}
                  y={endPointCanvasOffset.y}
                  offsetX={endPointHandleSize / 2}
                  offsetY={endPointHandleSize / 2}
                  width={endPointHandleSize}
                  height={endPointHandleSize}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={4}
                  cornerRadius={endPointHandleSize}
                  fill="#fff"
                  draggable
                  onDragMove={handleEndPoint2HandleDragMove}
                  onDragEnd={handleEndPoint2HandleDragEnd}
                />
              </>
            )}
          </Group>
        </Portal>
      )}
    </>
  )
}
