'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect, Circle, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardCircleObject } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { lengthToCanvasLength } from './calc'

const resizeHandleSize = 6

const resizeDirections = new Map<string, { x: -1 | 0 | 1, y: -1 | 0 | 1 }>([
  ['right', { x: 1, y: 0 }],
  ['bottom', { x: 0, y: 1 }],
  ['left', { x: -1, y: 0 }],
  ['top', { x: 0, y: -1 }],
])

export interface CircleCanvasObjectProps {
  object: StrategyBoardCircleObject
  selected?: boolean
  onResize?: (size: number) => VideoEncoderBitrateMode
}

export function CircleCanvasObject(props: CircleCanvasObjectProps) {
  const { object, selected, onResize } = props
  const { id, type, locked, size, transparency } = object

  const objectLibraryItem = objectLibrary.get(type)!

  const objectRef = useRef<Konva.Group>(null)

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const radius = lengthToCanvasLength(objectLibraryItem.baseSize / 2)
  const boundingRadius = radius * 256 / 265
  
  // 缩放
  const boundingBoxFrameRef = useRef<Konva.Circle>(null)
  const resizeHandlesRef = useRef(new Map<string, Konva.Rect>)

  const resizeObject = useCallback((size: number): void => {
    resizeHandlesRef.current.forEach((resizeHandle, id) => {
      const direction = resizeDirections.get(id)!
      resizeHandle.x(boundingRadius * size / 100 * direction.x)
      resizeHandle.y(boundingRadius * size / 100 * direction.y)
    })
    boundingBoxFrameRef.current?.scaleX(size / 100)
    boundingBoxFrameRef.current?.scaleY(size / 100)
    objectRef.current?.scaleX(size / 100)
    objectRef.current?.scaleY(size / 100)
  }, [boundingRadius])

  const handleResizeHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = Math.hypot(event.target.x() / boundingRadius, event.target.y() / boundingRadius) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    resizeObject(normalizedSize)
  }, [resizeObject, boundingRadius])
  const handleResizeHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const size = Math.hypot(event.target.x() / boundingRadius, event.target.y() / boundingRadius) * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    resizeObject(normalizedSize)
    onResize?.(normalizedSize)
  }, [resizeObject, boundingRadius, onResize])

  return (
    <>
      <Group
        ref={objectRef}
        clipFunc={ctx => {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, boundingRadius, 0, Math.PI * 2)
        }}
        opacity={1 - transparency / 100}
        scaleX={size / 100}
        scaleY={size / 100}
      >
        <Image
          offsetX={radius}
          offsetY={radius}
          width={radius * 2}
          height={radius * 2}
          image={backgroundImage}
          alt={objectLibraryItem.abbr}
        />
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group>
            <Circle
              ref={boundingBoxFrameRef}
              radius={boundingRadius}
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
                    x={boundingRadius * size / 100 * direction.x}
                    y={boundingRadius * size / 100 * direction.y}
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
              </>
            )}
          </Group>
        </Portal>
      )}
    </>
  )
}
