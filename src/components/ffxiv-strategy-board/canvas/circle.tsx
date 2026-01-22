'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect, Circle, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardCircleObject, baseRadius } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { useStrategyBoardCanvas } from './context'

const resizeHandleSize = 6

const resizeDirections = new Map<string, { x: -1 | 0 | 1, y: -1 | 0 | 1 }>([
  ['right', { x: 1, y: 0 }],
  ['bottom', { x: 0, y: 1 }],
  ['left', { x: -1, y: 0 }],
  ['top', { x: 0, y: -1 }],
])

export interface CircleCanvasObjectProps {
  object: StrategyBoardCircleObject
}

export function CircleCanvasObject(props: CircleCanvasObjectProps) {
  const { object } = props
  const { id, type, locked, size, transparency } = object

  const { zoomRatio, isObjectSelected, resizeObject } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const objectLibraryItem = objectLibrary.get(type)!

  const objectRef = useRef<Konva.Group>(null)

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const baseCanvasRadius = baseRadius * zoomRatio
  const baseBoundingCanvasRadius = baseCanvasRadius * 256 / 265

  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Circle>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>())

  const resizeObjectTemporarily = useCallback((size: number): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(baseBoundingCanvasRadius * size / 100 * direction.x)
      resizeHandle.y(baseBoundingCanvasRadius * size / 100 * direction.y)
    })
    boundingBoxFrameRef.current?.scaleX(size / 100)
    boundingBoxFrameRef.current?.scaleY(size / 100)
    objectRef.current?.scaleX(size / 100)
    objectRef.current?.scaleY(size / 100)
  }, [baseBoundingCanvasRadius])

  const getSizeFromResizeHandle = useCallback((resizeHandle: Konva.Node): number => {
    const size = Math.hypot(resizeHandle.x(), resizeHandle.y()) / baseBoundingCanvasRadius * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    return normalizedSize
  }, [baseBoundingCanvasRadius])

  const handleResizeHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = getSizeFromResizeHandle(event.target)
    resizeObjectTemporarily(size)
  }, [getSizeFromResizeHandle, resizeObjectTemporarily])
  const handleResizeHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = getSizeFromResizeHandle(event.target)
    resizeObjectTemporarily(size)
    resizeObject(id, size)
  }, [getSizeFromResizeHandle, resizeObjectTemporarily, id, resizeObject])

  return (
    <>
      <Group
        ref={objectRef}
        clipFunc={ctx => {
          ctx.beginPath()
          ctx.moveTo(baseBoundingCanvasRadius, 0)
          ctx.arc(0, 0, baseBoundingCanvasRadius, 0, Math.PI * 2)
        }}
        opacity={1 - transparency / 100}
        scaleX={size / 100}
        scaleY={size / 100}
      >
        <Image
          offsetX={baseCanvasRadius}
          offsetY={baseCanvasRadius}
          width={baseCanvasRadius * 2}
          height={baseCanvasRadius * 2}
          image={backgroundImage}
          alt={objectLibraryItem.abbr}
        />
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group>
            <Circle
              ref={boundingBoxFrameRef}
              radius={baseBoundingCanvasRadius}
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
                {[...resizeDirections.entries()].map(([id, direction]) => (
                  <Rect
                    key={id}
                    ref={ref => { resizeHandlesRef.current.set(id, ref!) }}
                    x={baseBoundingCanvasRadius * size / 100 * direction.x}
                    y={baseBoundingCanvasRadius * size / 100 * direction.y}
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
              </>
            )}
          </Group>
        </Portal>
      )}
    </>
  )
}
