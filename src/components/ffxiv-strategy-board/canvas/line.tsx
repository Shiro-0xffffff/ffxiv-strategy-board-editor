'use client'

import { useRef, useLayoutEffect, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect } from 'react-konva'
import { Portal } from 'react-konva-utils'
import { StrategyBoardLineObject } from '@/lib/ffxiv-strategy-board'

const endPointHandleSize = 8

export interface LineCanvasObjectProps {
  object: StrategyBoardLineObject
  zoomRatio?: number
  selected?: boolean
  onEndPointMove?: (endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }) => void
}

export function LineCanvasObject(props: LineCanvasObjectProps) {
  const { object, zoomRatio = 1, selected, onEndPointMove } = props
  const { id, locked, endPointOffset, lineWidth, transparency, color } = object

  const objectRef = useRef<Konva.Rect>(null)

  const length = Math.hypot(endPointOffset.x, endPointOffset.y) * zoomRatio * 2
  const rotation = Math.atan2(endPointOffset.y, endPointOffset.x) * 180 / Math.PI

  // 移动端点
  const boundingBoxRef = useRef<Konva.Group>(null)
  const boundingBoxFrameRef = useRef<Konva.Rect>(null)
  const endPoint1HandleRef = useRef<Konva.Rect>(null)
  const endPoint2HandleRef = useRef<Konva.Rect>(null)

  const moveEndPoints = useCallback((endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }): void => {
    const positionOffset = {
      x: (endPoint1.x + endPoint2.x) / 2 * zoomRatio,
      y: (endPoint1.y + endPoint2.y) / 2 * zoomRatio,
    }
    const length = Math.hypot(endPoint2.x - endPoint1.x, endPoint2.y - endPoint1.y) * zoomRatio
    const rotation = Math.atan2(endPoint2.y - endPoint1.y, endPoint2.x - endPoint1.x) * 180 / Math.PI

    boundingBoxFrameRef.current?.position(positionOffset)
    boundingBoxFrameRef.current?.offsetX(length / 2)
    boundingBoxFrameRef.current?.width(length)
    boundingBoxFrameRef.current?.rotation(rotation)
    objectRef.current?.position(positionOffset)
    objectRef.current?.offsetX(length / 2)
    objectRef.current?.width(length)
    objectRef.current?.rotation(rotation)
  }, [zoomRatio])

  const getEndPointsFromEndPointHandle = useCallback((endPoint1Handle: Konva.Node | null, endPoint2Handle: Konva.Node | null): [{ x: number, y: number }, { x: number, y: number }] => {
    const endPoint1 = endPoint1Handle?.position() ?? endPoint1HandleRef.current!.position()
    const endPoint2 = endPoint2Handle?.position() ?? endPoint2HandleRef.current!.position()
    const normalizedEndPoint1 = {
      x: Math.round(endPoint1.x / zoomRatio),
      y: Math.round(endPoint1.y / zoomRatio),
    }
    const normalizedEndPoint2 = {
      x: Math.round(endPoint2.x / zoomRatio),
      y: Math.round(endPoint2.y / zoomRatio),
    }
    return [normalizedEndPoint1, normalizedEndPoint2]
  }, [zoomRatio])

  const handleEndPoint1HandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(event.target, null)
    moveEndPoints(endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPoints])
  const handleEndPoint2HandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(null, event.target)
    moveEndPoints(endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPoints])
  const handleEndPoint1HandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(event.target, null)
    moveEndPoints(endPoint1, endPoint2)
    onEndPointMove?.(endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPoints, onEndPointMove])
  const handleEndPoint2HandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const [endPoint1, endPoint2] = getEndPointsFromEndPointHandle(null, event.target)
    moveEndPoints(endPoint1, endPoint2)
    onEndPointMove?.(endPoint1, endPoint2)
  }, [getEndPointsFromEndPointHandle, moveEndPoints, onEndPointMove])

  // TODO: 通过Ref直接修改图形属性后，prop无变化导致属性不会被更新，因此暂时手动重置，需要考虑更好的实现方式
  useLayoutEffect(() => {
    objectRef.current?.position({ x: 0, y: 0 })
    boundingBoxFrameRef.current?.position({ x: 0, y: 0 })
  })

  return (
    <>
      <Rect
        ref={objectRef}
        x={0}
        y={0}
        offsetX={length / 2}
        offsetY={lineWidth * zoomRatio / 2}
        width={length}
        height={lineWidth * zoomRatio}
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
              x={0}
              y={0}
              offsetX={length / 2}
              offsetY={lineWidth * zoomRatio / 2}
              width={length}
              height={lineWidth * zoomRatio}
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
                  x={-endPointOffset.x * zoomRatio}
                  y={-endPointOffset.y * zoomRatio}
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
                  x={endPointOffset.x * zoomRatio}
                  y={endPointOffset.y * zoomRatio}
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
