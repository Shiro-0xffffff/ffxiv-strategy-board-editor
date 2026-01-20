'use client'

import { useRef, useCallback } from 'react'
import Konva from 'konva'
import { Group, Rect, Circle, Arc, Image } from 'react-konva'
import { Portal } from 'react-konva-utils'
import useImage from 'use-image'
import { StrategyBoardArcObject, baseRadius, getArcCenterOffset } from '@/lib/ffxiv-strategy-board'
import { ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { useStrategyBoardCanvas } from './context'

const directionHandleSize = 8
const arcAngleHandleSize = 8
const innerRadiusHandleSize = 8

export interface ArcCanvasObjectProps {
  object: StrategyBoardArcObject
}

export function ArcCanvasObject(props: ArcCanvasObjectProps) {
  const { object } = props
  const { id, type, locked, size, flipped, rotation, transparency, arcAngle, innerRadius } = object

  const { zoomRatio, isObjectSelected, adjustObjectDirection, adjustObjectArcAngle, adjustObjectInnerRadius } = useStrategyBoardCanvas()
  const selected = isObjectSelected(id)

  const objectLibraryItem = objectLibrary.get(type)!

  const objectRef = useRef<Konva.Group>(null)

  const [backgroundImage] = useImage(ffxivImageUrl(objectLibraryItem.image ?? ''))
  
    const baseCanvasRadius = baseRadius * zoomRatio
    const baseBoundingCanvasRadius = baseCanvasRadius * 256 / 265
    const baseHoleCanvasRadius = baseCanvasRadius * innerRadius / 256
    const centerOffset = getArcCenterOffset(size, innerRadius, arcAngle, rotation, flipped)
    const centerCanvasOffset = {
      x: centerOffset.x * zoomRatio,
      y: centerOffset.y * zoomRatio,
    }
    
    // 调整方向
    const boundingBoxRef = useRef<Konva.Group>(null)
    const boundingBoxFrameRef = useRef<Konva.Arc>(null)
    const directionHandleRef = useRef<Konva.Circle>(null)
  
    const adjustObjectDirectionTemporarily = useCallback((direction: { size: number, rotation: number }): void => {
      directionHandleRef.current?.x(0)
      directionHandleRef.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
      arcAngleHandle1Ref.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
      arcAngleHandle2Ref.current?.y(-baseBoundingCanvasRadius * direction.size / 100)
      innerRadiusHandleRef.current?.y(-baseCanvasRadius * innerRadius / 256 * direction.size / 100)
      boundingBoxFrameRef.current?.scaleX(direction.size / 100)
      boundingBoxFrameRef.current?.scaleY(direction.size / 100 * (flipped ? -1 : 1))
      boundingBoxRef.current?.rotation(direction.rotation)
      objectRef.current?.scaleX(direction.size / 100 * (flipped ? -1 : 1))
      objectRef.current?.scaleY(direction.size / 100)
      objectRef.current?.rotation(direction.rotation)
    }, [baseCanvasRadius, baseBoundingCanvasRadius, flipped, innerRadius])
  
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
        ctx.arc(0, 0, baseHoleCanvasRadius, -Math.PI / 2 + arcAngle / 2 * Math.PI / 180, -Math.PI / 2 - arcAngle / 2 * Math.PI / 180, true)
      })
    }, [baseBoundingCanvasRadius, baseHoleCanvasRadius, size, flipped])

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
    
    // 调整环形范围
    const innerRadiusHandleRef = useRef<Konva.Rect>(null)
  
    const adjustObjectInnerRadiusTemporarily = useCallback((innerRadius: number): void => {
      innerRadiusHandleRef.current?.x(0)
      innerRadiusHandleRef.current?.y(-baseCanvasRadius * innerRadius / 256 * size / 100)
      boundingBoxFrameRef.current?.innerRadius(baseCanvasRadius * innerRadius / 256)
      objectRef.current?.clipFunc(ctx => {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, baseBoundingCanvasRadius, -Math.PI / 2 - arcAngle / 2 * Math.PI / 180, -Math.PI / 2 + arcAngle / 2 * Math.PI / 180)
        ctx.arc(0, 0, baseCanvasRadius * innerRadius / 256, -Math.PI / 2 + arcAngle / 2 * Math.PI / 180, -Math.PI / 2 - arcAngle / 2 * Math.PI / 180, true)
      })
    }, [baseCanvasRadius, baseBoundingCanvasRadius, size, arcAngle])
  
    const getInnerRadiusFromInnerRadiusHandle = useCallback((innerRadiusHandle: Konva.Node): number => {
      const innerRadius = Math.hypot(innerRadiusHandle.x(), innerRadiusHandle.y()) * 100 / size / baseCanvasRadius * 256
      const normalizedInnerRadius = Math.round(Math.min(Math.max(innerRadius, 0), 255))
      return normalizedInnerRadius
    }, [baseCanvasRadius, size])
  
    const handleInnerRadiusHandleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
      const innerRadius = getInnerRadiusFromInnerRadiusHandle(event.target)
      adjustObjectInnerRadiusTemporarily(innerRadius)
    }, [getInnerRadiusFromInnerRadiusHandle, adjustObjectInnerRadiusTemporarily])
    const handleInnerRadiusHandleDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>): void => {
      const innerRadius = getInnerRadiusFromInnerRadiusHandle(event.target)
      adjustObjectInnerRadiusTemporarily(innerRadius)
      adjustObjectInnerRadius(id, innerRadius)
    }, [getInnerRadiusFromInnerRadiusHandle, adjustObjectInnerRadiusTemporarily, id, adjustObjectInnerRadius])
  
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
                ctx.arc(0, 0, baseHoleCanvasRadius, -Math.PI / 2 + arcAngle / 2 * Math.PI / 180, -Math.PI / 2 - arcAngle / 2 * Math.PI / 180, true)
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
                  <Arc
                    ref={boundingBoxFrameRef}
                    innerRadius={baseHoleCanvasRadius}
                    outerRadius={baseBoundingCanvasRadius}
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
                        hitStrokeWidth={8}
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
                          hitStrokeWidth={8}
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
                          hitStrokeWidth={8}
                          shadowBlur={4}
                          fill="#fff"
                          rotation={45}
                          draggable
                          onDragMove={handleArcAngleHandleDragMove}
                          onDragEnd={handleArcAngleHandleDragEnd}
                        />
                      </Group>
                      <Rect
                        ref={innerRadiusHandleRef}
                        x={0}
                        y={-baseHoleCanvasRadius * size / 100}
                        offsetX={innerRadiusHandleSize / 2}
                        offsetY={innerRadiusHandleSize / 2}
                        width={innerRadiusHandleSize}
                        height={innerRadiusHandleSize}
                        stroke="#fff"
                        strokeWidth={2}
                        hitStrokeWidth={8}
                        shadowBlur={4}
                        fill="#fff"
                        rotation={45}
                        draggable
                        onDragMove={handleInnerRadiusHandleDragMove}
                        onDragEnd={handleInnerRadiusHandleDragEnd}
                      />
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
