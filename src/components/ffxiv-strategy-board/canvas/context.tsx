'use client'

import { ReactNode, createContext, useState, useContext, useCallback } from 'react'
import {
  StrategyBoardObjectType,
  normalizePosition,
  normalizeRotation,
  normalizeSize,
  normalizeWidth,
  normalizeHeight,
  normalizeArcAngle,
  normalizeInnerRadius,
  normalizeLineEndPoint,
  getConeCenterOffset,
  getArcCenterOffset,
} from '@/lib/ffxiv-strategy-board'

import { useStrategyBoard } from '../context'

const defaultZoomRatio = 0.2
const zoomLevels = [0.05, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.8, 1]

export interface StrategyBoardCanvasContextProps {
  preview: boolean
  zoomRatio: number
  isZoomInAvailable: boolean
  zoomIn: () => void
  isZoomOutAvailable: boolean
  zoomOut: () => void
  isObjectSelected: (id: string) => boolean
  moveObject: (id: string, position: { x: number, y: number }) => void
  moveObjects: (positions: { id: string, position: { x: number, y: number } }[]) => void
  flipObjectHorizontally: (id: string) => void
  flipObjectsHorizontally: (ids: string[]) => void
  flipObjectVertically: (id: string) => void
  flipObjectsVertically: (ids: string[]) => void
  resizeObject: (id: string, size: number | { width: number, height: number }) => void
  rotateObject: (id: string, rotation: number) => void
  adjustObjectDirection: (id: string, direction: { size: number, rotation: number }) => void
  adjustObjectArcAngle: (id: string, arcAngle: number) => void
  adjustObjectInnerRadius: (id: string, innerRadius: number) => void
  moveEndPoints: (id: string, endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }) => void
}

const StrategyBoardCanvasContext = createContext<StrategyBoardCanvasContextProps | null>(null)

export function useStrategyBoardCanvas(): StrategyBoardCanvasContextProps {
  const context = useContext(StrategyBoardCanvasContext)
  if (!context) throw new Error('`useStrategyBoardCanvas` 需要在 `StrategyBoardCanvasProvider` 内部使用')
  return context
}

export interface StrategyBoardCanvasProviderProps {
  preview?: boolean
  children?: ReactNode
}

export function StrategyBoardCanvasProvider(props: StrategyBoardCanvasProviderProps) {
  const { preview = false, children } = props

  const { selectedObjectIds, modifyObject, modifyObjects } = useStrategyBoard()

  const [zoomRatio, setZoomRatio] = useState<number>(defaultZoomRatio)

  const isZoomInAvailable = zoomLevels.some(zoomLevel => zoomLevel > zoomRatio)
  const zoomIn = useCallback((): void => {
    const zoomLevel = zoomLevels.find(zoomLevel => zoomLevel > zoomRatio)
    if (!zoomLevel) return
    setZoomRatio(zoomLevel)
  }, [zoomRatio])
  const isZoomOutAvailable = zoomLevels.some(zoomLevel => zoomLevel < zoomRatio)
  const zoomOut = useCallback((): void => {
    const zoomLevel = zoomLevels.findLast(zoomLevel => zoomLevel < zoomRatio)
    if (!zoomLevel) return
    setZoomRatio(zoomLevel)
  }, [zoomRatio])

  const isObjectSelected = useCallback((id: string): boolean => {
    return !preview && selectedObjectIds.includes(id)
  }, [preview, selectedObjectIds])

  const moveObjects = useCallback((positions: { id: string, position: { x: number, y: number } }[]): void => {
    modifyObjects(positions.map(({ id, position }) => ({ id, modification: object => {
      object.position = normalizePosition(position)
    }})))
  }, [modifyObjects])
  const moveObject = useCallback((id: string, position: { x: number, y: number }): void => {
    moveObjects([{ id, position }])
  }, [moveObjects])

  const flipObjectsHorizontally = useCallback((ids: string[]): void => {
    modifyObjects(ids.map(id => ({ id, modification: object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.Rectangle:
        case StrategyBoardObjectType.MechanicCircleAoE:
          break
        case StrategyBoardObjectType.Line:
          object.endPointOffset = { x: -object.endPointOffset.x, y: object.endPointOffset.y }
          break
        default:
          object.flipped = !object.flipped
          object.rotation = normalizeRotation(-object.rotation)
      }
    }})))
  }, [modifyObjects])
  const flipObjectHorizontally = useCallback((id: string): void => {
    flipObjectsHorizontally([id])
  }, [flipObjectsHorizontally])
  const flipObjectsVertically = useCallback((ids: string[]): void => {
    modifyObjects(ids.map(id => ({ id, modification: object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.Rectangle:
        case StrategyBoardObjectType.MechanicCircleAoE:
          break
        case StrategyBoardObjectType.Line:
          object.endPointOffset = { x: object.endPointOffset.x, y: -object.endPointOffset.y }
          break
        default:
          object.flipped = !object.flipped
          object.rotation = normalizeRotation(180 - object.rotation)
      }
    }})))
  }, [modifyObjects])
  const flipObjectVertically = useCallback((id: string): void => {
    flipObjectsVertically([id])
  }, [flipObjectsVertically])

  const resizeObject = useCallback((id: string, size: number | { width: number, height: number }): void => {
    modifyObject(id, object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.Line:
          break
        case StrategyBoardObjectType.Rectangle:
          object.size = {
            width: normalizeWidth((size as { width: number, height: number }).width),
            height: normalizeHeight((size as { width: number, height: number }).height),
          }
          break
        default:
          object.size = normalizeSize(size as number)
      }
    })
  }, [modifyObject])

  const rotateObject = useCallback((id: string, rotation: number): void => {
    modifyObject(id, object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.Line:
        case StrategyBoardObjectType.MechanicCircleAoE:
          break
        default:
          object.rotation = normalizeRotation(rotation)
      }
    })
  }, [modifyObject])

  const adjustObjectDirection = useCallback((id: string, direction: { size: number, rotation: number }): void => {
    modifyObject(id, object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.Line:
          break
        case StrategyBoardObjectType.Rectangle:
          object.rotation = normalizeRotation(direction.rotation)
          break
        case StrategyBoardObjectType.MechanicCircleAoE:
          object.size = normalizeSize(direction.size)
          break
        case StrategyBoardObjectType.MechanicConeAoE:
          const coneCenterOffset = getConeCenterOffset(object.size, object.arcAngle, object.rotation, object.flipped)
          const updatedConeCenterOffset = getConeCenterOffset(direction.size, object.arcAngle, direction.rotation, object.flipped)
          object.position = normalizePosition({
            x: object.position.x - coneCenterOffset.x + updatedConeCenterOffset.x,
            y: object.position.y - coneCenterOffset.y + updatedConeCenterOffset.y,
          })
          object.size = normalizeSize(direction.size)
          object.rotation = normalizeRotation(direction.rotation)
          break
        case StrategyBoardObjectType.MechanicDonutAoE:
          const arcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, object.rotation, object.flipped)
          const updatedArcCenterOffset = getArcCenterOffset(direction.size, object.innerRadius, object.arcAngle, direction.rotation, object.flipped)
          object.position = normalizePosition({
            x: object.position.x - arcCenterOffset.x + updatedArcCenterOffset.x,
            y: object.position.y - arcCenterOffset.y + updatedArcCenterOffset.y,
          })
          object.size = normalizeSize(direction.size)
          object.rotation = normalizeRotation(direction.rotation)
          break
        default:
          object.size = normalizeSize(direction.size)
          object.rotation = normalizeRotation(direction.rotation)
      }
    })
  }, [modifyObject])

  const adjustObjectArcAngle = useCallback((id: string, arcAngle: number): void => {
    modifyObject(id, object => {
      switch (object.type) {
        case StrategyBoardObjectType.MechanicConeAoE:
          const updatedConeRotation = object.rotation + (object.arcAngle - arcAngle) / 2 * (object.flipped ? -1 : 1)
          const coneCenterOffset = getConeCenterOffset(object.size, object.arcAngle, object.rotation, object.flipped)
          const updatedConeCenterOffset = getConeCenterOffset(object.size, arcAngle, updatedConeRotation, object.flipped)
          object.position = normalizePosition({
            x: object.position.x - coneCenterOffset.x + updatedConeCenterOffset.x,
            y: object.position.y - coneCenterOffset.y + updatedConeCenterOffset.y,
          })
          object.rotation = normalizeRotation(updatedConeRotation)
          object.arcAngle = normalizeArcAngle(arcAngle)
          break
        case StrategyBoardObjectType.MechanicDonutAoE:
          const updatedArcRotation = object.rotation + (object.arcAngle - arcAngle) / 2 * (object.flipped ? -1 : 1)
          const arcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, object.rotation, object.flipped)
          const updatedArcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, arcAngle, updatedArcRotation, object.flipped)
          object.position = normalizePosition({
            x: object.position.x - arcCenterOffset.x + updatedArcCenterOffset.x,
            y: object.position.y - arcCenterOffset.y + updatedArcCenterOffset.y,
          })
          object.rotation = normalizeRotation(updatedArcRotation)
          object.arcAngle = normalizeArcAngle(arcAngle)
          break
      }
    })
  }, [modifyObject])

  const adjustObjectInnerRadius = useCallback((id: string, innerRadius: number): void => {
    modifyObject(id, object => {
      if (object.type !== StrategyBoardObjectType.MechanicDonutAoE) return
      const arcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, object.rotation, object.flipped)
      const updatedArcCenterOffset = getArcCenterOffset(object.size, innerRadius, object.arcAngle, object.rotation, object.flipped)
      object.position = normalizePosition({
        x: object.position.x - arcCenterOffset.x + updatedArcCenterOffset.x,
        y: object.position.y - arcCenterOffset.y + updatedArcCenterOffset.y,
      })
      object.innerRadius = normalizeInnerRadius(innerRadius)
    })
  }, [modifyObject])

  const moveEndPoints = useCallback((id: string, endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }): void => {
    modifyObject(id, object => {
      if (object.type !== StrategyBoardObjectType.Line) return
      const [normalizedEndPoint1, normalizedEndPoint2] = normalizeLineEndPoint(endPoint1, endPoint2)
      const position = {
        x: Math.round((normalizedEndPoint1.x + normalizedEndPoint2.x) / 2),
        y: Math.round((normalizedEndPoint1.y + normalizedEndPoint2.y) / 2),
      }
      const endPointOffset = {
        x: Math.round((normalizedEndPoint2.x - normalizedEndPoint1.x) / 2),
        y: Math.round((normalizedEndPoint2.y - normalizedEndPoint1.y) / 2),
      }
      object.position = position
      object.endPointOffset = endPointOffset
    })
  }, [modifyObject])

  const contextValue: StrategyBoardCanvasContextProps = {
    preview,
    zoomRatio,
    isZoomInAvailable,
    zoomIn,
    isZoomOutAvailable,
    zoomOut,
    isObjectSelected,
    moveObject,
    moveObjects,
    flipObjectHorizontally,
    flipObjectsHorizontally,
    flipObjectVertically,
    flipObjectsVertically,
    resizeObject,
    rotateObject,
    adjustObjectDirection,
    adjustObjectArcAngle,
    adjustObjectInnerRadius,
    moveEndPoints,
  }

  return (
    <StrategyBoardCanvasContext.Provider value={contextValue}>
      {children}
    </StrategyBoardCanvasContext.Provider>
  )
}
