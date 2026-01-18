'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect, Circle, Wedge, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardConeObject, baseRadius, getConeCenterOffset } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { useStrategyBoardCanvas } from './context'

const directionHandleSize = 8
const arcAngleHandleSize = 8

export interface ConeCanvasObjectProps {
  object: StrategyBoardConeObject
}

export function ConeCanvasObject(props: ConeCanvasObjectProps) {
  const { object } = props
  const { id, type, locked, size, flipped, rotation, transparency, arcAngle } = object

  const { zoomRatio, isObjectSelected, adjustObjectDirection, adjustObjectArcAngle } = useStrategyBoardCanvas()
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
  const directionHandleRef = useRef<Konva.Circle>(null)

  const adjustObjectDirectionTemporarily = useCallback((direction: { size: number, rotation: number }): void => {
    directionHandleRef.current?.x(0)
    directionHandleRef.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
    arcAngleHandle1Ref.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
    arcAngleHandle2Ref.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
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

  // 调整范围角度
  const arcAngleHandle1Ref = useRef<Konva.Rect>(null)
  const arcAngleHandle2Ref = useRef<Konva.Rect>(null)

  const adjustObjectArcAngleTemporarily = useCallback((arcAngle: number): void => {
    arcAngleHandle1Ref.current?.x(0)
    arcAngleHandle1Ref.current?.y(-baseBoundingCanvasRadius * size / 100)
    arcAngleHandle1Ref.current?.parent?.rotation(arcAngle / 2 * (flipped ? -1 : 1))
    arcAngleHandle2Ref.current?.x(0)
    arcAngleHandle2Ref.current?.y(-baseBoundingCanvasRadius * size / 100)
    arcAngleHandle2Ref.current?.parent?.rotation(-arcAngle / 2 * (flipped ? -1 : 1))
    boundingBoxFrameRef.current?.angle(arcAngle)
    boundingBoxFrameRef.current?.rotation(-90 - arcAngle / 2 * (flipped ? -1 : 1))
    objectRef.current?.clipFunc(ctx => {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, baseBoundingCanvasRadius, -Math.PI / 2 - arcAngle / 2 * Math.PI / 180, -Math.PI / 2 + arcAngle / 2 * Math.PI / 180)
    })
  }, [baseBoundingCanvasRadius, size, flipped])

  const getArcAngleFromArcAngleHandle = useCallback((arcAngleHandle: Konva.Node): number => {
    const arcAngle = Math.abs((arcAngleHandle.parent?.rotation() ?? 0) + Math.atan2(arcAngleHandle.x(), -arcAngleHandle.y()) * 180 / Math.PI) * 2
    const normalizedArcAngle = Math.round(Math.min(Math.max(arcAngle, 0), 360))
    return normalizedArcAngle
  }, [])

  const handleArcAngleHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const arcAngle = getArcAngleFromArcAngleHandle(event.target)
    adjustObjectArcAngleTemporarily(arcAngle)
  }, [getArcAngleFromArcAngleHandle, adjustObjectArcAngleTemporarily])
  const handleArcAngleHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
    const arcAngle = getArcAngleFromArcAngleHandle(event.target)
    adjustObjectArcAngleTemporarily(arcAngle)
    adjustObjectArcAngle(id, arcAngle)
  }, [getArcAngleFromArcAngleHandle, adjustObjectArcAngleTemporarily, id, adjustObjectArcAngle])

  return (
    <>
      <Group
        offsetX={centerCanvasOffset.x}
        offsetY={centerCanvasOffset.y}
      >
        <Group
          rotation={arcAngle / 2 * (flipped ? -1 : 1)}
        >
          <Group
            ref={objectRef}
            clipFunc={ctx => {
              ctx.beginPath()
              ctx.moveTo(0, 0)
              ctx.arc(0, 0, baseBoundingCanvasRadius, -Math.PI / 2 - arcAngle / 2 * Math.PI / 180, -Math.PI / 2 + arcAngle / 2 * Math.PI / 180)
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
      </Group>
      {!!selected && (
        <Portal selector={`.object-${id}-bounding-box`}>
          <Group
            offsetX={centerCanvasOffset.x}
            offsetY={centerCanvasOffset.y}
          >
            <Group
              rotation={arcAngle / 2 * (flipped ? -1 : 1)}
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
                  rotation={-90 - arcAngle / 2 * (flipped ? -1 : 1)}
                  listening={false}
                />
                {!locked && (
                  <>
                    <Circle
                      radius={2}
                      stroke="#fff"
                      strokeWidth={2}
                      shadowBlur={4}
                      fill="#fff"
                    />
                    <Circle
                      ref={directionHandleRef}
                      x={0}
                      y={-baseBoundingCanvasRadius * size / 100}
                      radius={directionHandleSize / 2}
                      stroke="#fff"
                      strokeWidth={2}
                      shadowBlur={4}
                      fill="#fff"
                      draggable
                      onDragMove={handleDirectionHandleDragMove}
                      onDragEnd={handleDirectionHandleDragEnd}
                    />
                    <Group
                      rotation={arcAngle / 2 * (flipped ? -1 : 1)}
                    >
                      <Rect
                        ref={arcAngleHandle1Ref}
                        x={0}
                        y={-baseBoundingCanvasRadius * size / 100}
                        offsetX={arcAngleHandleSize / 2}
                        offsetY={arcAngleHandleSize / 2}
                        width={arcAngleHandleSize}
                        height={arcAngleHandleSize}
                        stroke="#fff"
                        strokeWidth={2}
                        shadowBlur={4}
                        fill="#fff"
                        rotation={45}
                        draggable
                        onDragMove={handleArcAngleHandleDragMove}
                        onDragEnd={handleArcAngleHandleDragEnd}
                      />
                    </Group>
                    <Group
                      rotation={-arcAngle / 2 * (flipped ? -1 : 1)}
                    >
                      <Rect
                        ref={arcAngleHandle2Ref}
                        x={0}
                        y={-baseBoundingCanvasRadius * size / 100}
                        offsetX={arcAngleHandleSize / 2}
                        offsetY={arcAngleHandleSize / 2}
                        width={arcAngleHandleSize}
                        height={arcAngleHandleSize}
                        stroke="#fff"
                        strokeWidth={2}
                        shadowBlur={4}
                        fill="#fff"
                        rotation={45}
                        draggable
                        onDragMove={handleArcAngleHandleDragMove}
                        onDragEnd={handleArcAngleHandleDragEnd}
                      />
                    </Group>
                  </>
                )}
              </Group>
            </Group>
          </Group>
        </Portal>
      )}
    </>
  )
}
