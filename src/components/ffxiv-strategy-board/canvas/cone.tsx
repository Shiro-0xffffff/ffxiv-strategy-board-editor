'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect, Wedge, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardConeObject, baseRadius, getConeCenterOffset } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { useStrategyBoardCanvas } from './context'

const directionHandleSize = 8

export interface ConeCanvasObjectProps {
  object: StrategyBoardConeObject
}

export function ConeCanvasObject(props: ConeCanvasObjectProps) {
  const { object } = props
  const { id, type, locked, size, flipped, rotation, transparency, arcAngle } = object

  const { zoomRatio, isObjectSelected, adjustObjectDirection } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const objectLibraryItem = objectLibrary.get(type)!

  const objectRef = useRef<Konva.Group>(null)

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))

  const baseCanvasRadius = baseRadius * zoomRatio
  const baseBoundingCanvasRadius = baseCanvasRadius * 256 / 265
  const centerOffset = getConeCenterOffset(size, arcAngle, rotation, flipped)
  const centerCanvasOffset = {
    x: centerOffset.x * zoomRatio,
    y: centerOffset.y * zoomRatio,
  }
  
  // 调整方向
  const boundingBoxRef = useRef<Konva.Group>(null)
  const boundingBoxFrameRef = useRef<Konva.Wedge>(null)
  const directionHandleRef = useRef<Konva.Rect>(null)

  const adjustObjectDirectionTemporarily = useCallback((direction: { size: number, rotation: number }): void => {
    directionHandleRef.current?.x(0)
    directionHandleRef.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
    boundingBoxFrameRef.current?.scaleX(direction.size / 100)
    boundingBoxFrameRef.current?.scaleY(direction.size / 100 * (flipped ? -1 : 1))
    boundingBoxRef.current?.rotation(direction.rotation)
    objectRef.current?.scaleX(direction.size / 100 * (flipped ? -1 : 1))
    objectRef.current?.scaleY(direction.size / 100)
    objectRef.current?.rotation(direction.rotation)
  }, [baseBoundingCanvasRadius, flipped])

  const getDirectionFromDirectionHandle = useCallback((directionHandle: Konva.Node): { size: number, rotation: number } => {
    const size = Math.hypot(directionHandle.x(), directionHandle.y()) / baseBoundingCanvasRadius * 100
    const normalizedSize = Math.round(Math.min(Math.max(size, 0), 255))
    const rotation = (boundingBoxRef.current?.rotation() ?? 0) + Math.atan2(directionHandle.x(), -directionHandle.y()) * 180 / Math.PI
    const normalizedRotation = Math.round(rotation % 360)
    return { size: normalizedSize, rotation: normalizedRotation }
  }, [baseBoundingCanvasRadius])

  const handleDirectionHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const direction = getDirectionFromDirectionHandle(event.target)
    adjustObjectDirectionTemporarily(direction)
  }, [getDirectionFromDirectionHandle, adjustObjectDirectionTemporarily])
  const handleDirectionHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const direction = getDirectionFromDirectionHandle(event.target)
    adjustObjectDirectionTemporarily(direction)
    adjustObjectDirection(id, direction)
  }, [getDirectionFromDirectionHandle, adjustObjectDirectionTemporarily, id, adjustObjectDirection])

  return (
    <>
      <Group
        offsetX={centerCanvasOffset.x}
        offsetY={centerCanvasOffset.y}
      >
        <Group
          ref={objectRef}
          clipFunc={ctx => {
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, baseBoundingCanvasRadius, -Math.PI / 2, -Math.PI / 2 + arcAngle * Math.PI / 180)
          }}
          opacity={1 - transparency / 100}
          scaleX={size / 100 * (flipped ? -1 : 1)}
          scaleY={size / 100}
          rotation={rotation}
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
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group
            offsetX={centerCanvasOffset.x}
            offsetY={centerCanvasOffset.y}
          >
            <Group
              ref={boundingBoxRef}
              rotation={rotation}
            >
              <Wedge
                ref={boundingBoxFrameRef}
                radius={baseBoundingCanvasRadius}
                angle={arcAngle}
                stroke="#fff"
                strokeWidth={2}
                shadowBlur={4}
                scaleX={size / 100}
                scaleY={size / 100 * (flipped ? -1 : 1)}
                strokeScaleEnabled={false}
                rotation={-90}
                listening={false}
              />
              {!locked && (
                <>
                  <Group
                    rotation={arcAngle / 2 * (flipped ? -1 : 1)}
                  >
                    <Rect
                      ref={directionHandleRef}
                      x={0}
                      y={-baseBoundingCanvasRadius * size / 100}
                      offsetX={directionHandleSize / 2}
                      offsetY={directionHandleSize / 2}
                      width={directionHandleSize}
                      height={directionHandleSize}
                      stroke="#fff"
                      strokeWidth={2}
                      shadowBlur={4}
                      cornerRadius={directionHandleSize}
                      fill="#fff"
                      draggable
                      onDragMove={handleDirectionHandleDragMove}
                      onDragEnd={handleDirectionHandleDragEnd}
                    />
                  </Group>
                </>
              )}
            </Group>
          </Group>
        </Portal>
      )}
    </>
  )
}
