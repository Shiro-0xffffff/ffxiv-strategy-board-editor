'use client'

import { ReactNode, createContext, useState, useContext, useMemo, useCallback } from 'react'
import {
  StrategyBoardScene,
  StrategyBoardObject,
  StrategyBoardObjectType,
  sceneWidth,
  sceneHeight,
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

const defaultZoomLevel = -2
const minZoomLevel = -4
const maxZoomLevel = 0

export interface StrategyBoardCanvasContextProps {
  scene: StrategyBoardScene
  canvasSize: { width: number, height: number } | null
  setCanvasSize: (size: { width: number, height: number }) => void
  canvasOffset: { x: number, y: number }
  setCanvasOffset: (offset: { x: number, y: number }) => void
  zoomLevel: number
  zoomRatio: number
  isZoomInAvailable: boolean
  zoomIn: (level?: number) => void
  isZoomOutAvailable: boolean
  zoomOut: (level?: number) => void
  resetCanvas: (size: { width: number, height: number }, padding?: number) => void
  setFixedZoomRatio: (zoomRatio: number | null) => void
  isObjectSelected: (id: string) => boolean
  getObject: (id: string) => StrategyBoardObject | null
  addObjectAtCanvasPosition: (type: StrategyBoardObjectType, canvasPosition: { x: number, y: number })=> void
  moveObject: (id: string, position: { x: number, y: number }, transition?: boolean) => void
  moveObjects: (positions: { id: string, position: { x: number, y: number } }[], transition?: boolean) => void
  flipObjectHorizontally: (id: string) => void
  flipObjectsHorizontally: (ids: string[]) => void
  flipObjectVertically: (id: string) => void
  flipObjectsVertically: (ids: string[]) => void
  resizeObject: (id: string, size: number | { width: number, height: number }, transition?: boolean) => void
  rotateObject: (id: string, rotation: number, transition?: boolean) => void
  adjustObjectDirection: (id: string, direction: { size: number, rotation: number }, transition?: boolean) => void
  adjustObjectArcAngle: (id: string, arcAngle: number, transition?: boolean) => void
  adjustObjectInnerRadius: (id: string, innerRadius: number, transition?: boolean) => void
  moveEndPoints: (id: string, endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }, transition?: boolean) => void
}

const StrategyBoardCanvasContext = createContext<StrategyBoardCanvasContextProps | null>(null)

export function useStrategyBoardCanvas(): StrategyBoardCanvasContextProps {
  const context = useContext(StrategyBoardCanvasContext)
  if (!context) throw new Error('`useStrategyBoardCanvas` 需要在 `StrategyBoardCanvasProvider` 内部使用')
  return context
}

export interface StrategyBoardCanvasProviderProps {
  children?: ReactNode
}

export function StrategyBoardCanvasProvider(props: StrategyBoardCanvasProviderProps) {
  const { children } = props

  const { scene, selectedObjectIds, addObject, modifyObject, modifyObjects } = useStrategyBoard()

  const [frozenScene, setFrozenScene] = useState<StrategyBoardScene | null>(null)

  const [canvasSize, setCanvasSize] = useState<{ width: number, height: number } | null>(null)
  const [canvasOffset, setCanvasOffset] = useState<{ x: number, y: number }>(() => ({ x: 0, y: 0 }))

  const [zoomLevel, setZoomLevel] = useState<number>(defaultZoomLevel)
  const [fixedZoomRatio, setFixedZoomRatio] = useState<number | null>(null)

  const zoomRatio = useMemo(() => fixedZoomRatio ?? Math.pow(2, zoomLevel), [fixedZoomRatio, zoomLevel])

  const isZoomInAvailable = zoomLevel < maxZoomLevel
  const zoomIn = useCallback((level: number = 0.5): void => {
    setZoomLevel(zoomLevel => Math.min(zoomLevel + level, maxZoomLevel))
  }, [])
  const isZoomOutAvailable = zoomLevel > minZoomLevel
  const zoomOut = useCallback((level: number = 0.5): void => {
    setZoomLevel(zoomLevel => Math.max(zoomLevel - level, minZoomLevel))
  }, [])

  const resetCanvas = useCallback((size: { width: number, height: number }, padding: number = 32): void => {
    setCanvasOffset({ x: 0, y: 0 })
    const horizontalZoomRatio = (size.width - padding * 2) / sceneWidth
    const verticalZoomRatio = (size.height - padding * 2) / sceneHeight
    setZoomLevel(Math.min(Math.log2(Math.min(horizontalZoomRatio, verticalZoomRatio)), defaultZoomLevel))
  }, [])

  const isObjectSelected = useCallback((id: string): boolean => {
    return selectedObjectIds.includes(id)
  }, [selectedObjectIds])

  const getObject = useCallback((id: string): StrategyBoardObject | null => {
    return (frozenScene ?? scene).objects.find(object => object.id === id) ?? null
  }, [scene, frozenScene])

  const addObjectAtCanvasPosition = useCallback((type: StrategyBoardObjectType, canvasPosition: { x: number, y: number }): void => {
    const position = {
      x: Math.round((canvasPosition.x - canvasOffset.x) / zoomRatio),
      y: Math.round((canvasPosition.y - canvasOffset.y) / zoomRatio),
    }
    if (position.x >= -sceneWidth / 2 && position.x <= sceneWidth && position.y >= -sceneHeight / 2 && position.y <= sceneHeight / 2) {
      addObject(type, { position })
    }
  }, [canvasOffset, zoomRatio, addObject])

  const moveObjects = useCallback((positions: { id: string, position: { x: number, y: number } }[], transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
    modifyObjects(positions.map(({ id, position }) => ({ id, modification: object => {
      object.position = normalizePosition(position)
    }})), transition)
  }, [scene, modifyObjects])
  const moveObject = useCallback((id: string, position: { x: number, y: number }, transition?: boolean): void => {
    moveObjects([{ id, position }], transition)
  }, [moveObjects])

  const flipObjectsHorizontally = useCallback((ids: string[]): void => {
    modifyObjects(ids.map(id => ({ id, modification: object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.MechanicCircleAoE:
          break
        case StrategyBoardObjectType.Line:
          object.endPointOffset = { x: -object.endPointOffset.x, y: object.endPointOffset.y }
          break
        case StrategyBoardObjectType.Rectangle:
          object.rotation = normalizeRotation(-object.rotation)
          break
        case StrategyBoardObjectType.MechanicConeAoE:
          const coneCenterOffset = getConeCenterOffset(object.size, object.arcAngle, object.rotation, object.flipped)
          const updatedConeCenterOffset = getConeCenterOffset(object.size, object.arcAngle, -object.rotation, !object.flipped)
          object.position = normalizePosition({
            x: object.position.x - coneCenterOffset.x + updatedConeCenterOffset.x,
            y: object.position.y - coneCenterOffset.y + updatedConeCenterOffset.y,
          })
          object.flipped = !object.flipped
          object.rotation = normalizeRotation(-object.rotation)
          break
        case StrategyBoardObjectType.MechanicDonutAoE:
          const arcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, object.rotation, object.flipped)
          const updatedArcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, -object.rotation, !object.flipped)
          object.position = normalizePosition({
            x: object.position.x - arcCenterOffset.x + updatedArcCenterOffset.x,
            y: object.position.y - arcCenterOffset.y + updatedArcCenterOffset.y,
          })
          object.flipped = !object.flipped
          object.rotation = normalizeRotation(-object.rotation)
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
        case StrategyBoardObjectType.MechanicCircleAoE:
          break
        case StrategyBoardObjectType.Line:
          object.endPointOffset = { x: object.endPointOffset.x, y: -object.endPointOffset.y }
          break
        case StrategyBoardObjectType.Rectangle:
          object.rotation = normalizeRotation(180 - object.rotation)
          break
        case StrategyBoardObjectType.MechanicConeAoE:
          const coneCenterOffset = getConeCenterOffset(object.size, object.arcAngle, object.rotation, object.flipped)
          const updatedConeCenterOffset = getConeCenterOffset(object.size, object.arcAngle, 180 - object.rotation, !object.flipped)
          object.position = normalizePosition({
            x: object.position.x - coneCenterOffset.x + updatedConeCenterOffset.x,
            y: object.position.y - coneCenterOffset.y + updatedConeCenterOffset.y,
          })
          object.flipped = !object.flipped
          object.rotation = normalizeRotation(180 - object.rotation)
          break
        case StrategyBoardObjectType.MechanicDonutAoE:
          const arcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, object.rotation, object.flipped)
          const updatedArcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, 180 - object.rotation, !object.flipped)
          object.position = normalizePosition({
            x: object.position.x - arcCenterOffset.x + updatedArcCenterOffset.x,
            y: object.position.y - arcCenterOffset.y + updatedArcCenterOffset.y,
          })
          object.flipped = !object.flipped
          object.rotation = normalizeRotation(180 - object.rotation)
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

  const resizeObject = useCallback((id: string, size: number | { width: number, height: number }, transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
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
    }, transition)
  }, [scene, modifyObject])

  const rotateObject = useCallback((id: string, rotation: number, transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
    modifyObject(id, object => {
      switch (object.type) {
        case StrategyBoardObjectType.Text:
        case StrategyBoardObjectType.Line:
        case StrategyBoardObjectType.MechanicCircleAoE:
          break
        default:
          object.rotation = normalizeRotation(rotation)
      }
    }, transition)
  }, [scene, modifyObject])

  const adjustObjectDirection = useCallback((id: string, direction: { size: number, rotation: number }, transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
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
    }, transition)
  }, [scene, modifyObject])

  const adjustObjectArcAngle = useCallback((id: string, arcAngle: number, transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
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
    }, transition)
  }, [scene, modifyObject])

  const adjustObjectInnerRadius = useCallback((id: string, innerRadius: number, transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
    modifyObject(id, object => {
      if (object.type !== StrategyBoardObjectType.MechanicDonutAoE) return
      const arcCenterOffset = getArcCenterOffset(object.size, object.innerRadius, object.arcAngle, object.rotation, object.flipped)
      const updatedArcCenterOffset = getArcCenterOffset(object.size, innerRadius, object.arcAngle, object.rotation, object.flipped)
      object.position = normalizePosition({
        x: object.position.x - arcCenterOffset.x + updatedArcCenterOffset.x,
        y: object.position.y - arcCenterOffset.y + updatedArcCenterOffset.y,
      })
      object.innerRadius = normalizeInnerRadius(innerRadius)
    }, transition)
  }, [scene, modifyObject])

  const moveEndPoints = useCallback((id: string, endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }, transition?: boolean): void => {
    setFrozenScene(frozenScene => transition ? frozenScene ?? scene : null)
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
    }, transition)
  }, [scene, modifyObject])

  const contextValue: StrategyBoardCanvasContextProps = {
    scene: frozenScene ?? scene,
    canvasSize,
    setCanvasSize,
    canvasOffset,
    setCanvasOffset,
    zoomLevel,
    zoomRatio,
    isZoomInAvailable,
    zoomIn,
    isZoomOutAvailable,
    zoomOut,
    resetCanvas,
    setFixedZoomRatio,
    isObjectSelected,
    getObject,
    addObjectAtCanvasPosition,
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
