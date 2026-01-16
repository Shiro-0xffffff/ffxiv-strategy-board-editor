'use client'

import { ReactNode, createContext, useState, useContext, useCallback } from 'react'
import {
  StrategyBoardObjectType,
  normalizePosition,
  normalizeRotation,
  normalizeSize,
  normalizeWidth,
  normalizeHeight,
  normalizeLineEndPoint,
} from '@/lib/ffxiv-strategy-board'

import { useStrategyBoard } from '../context'

const defaultZoomRatio = 0.2
const zoomLevels = [0.05, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.8, 1]

export interface StrategyBoardCanvasContextProps {
  preview: boolean
  zoomRatio: number
  zoomInAvailable: boolean
  zoomIn: () => void
  zoomOutAvailable: boolean
  zoomOut: () => void
  isObjectSelected: (id: string) => boolean
  moveObject: (id: string, position: { x: number, y: number }) => void
  moveObjects: (positions: { id: string, position: { x: number, y: number } }[]) => void
  resizeObject: (id: string, size: number | { width: number, height: number }) => void
  rotateObject: (id: string, rotation: number) => void
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

  const zoomInAvailable = zoomLevels.some(zoomLevel => zoomLevel > zoomRatio)
  const zoomIn = useCallback((): void => {
    const zoomLevel = zoomLevels.find(zoomLevel => zoomLevel > zoomRatio)
    if (!zoomLevel) return
    setZoomRatio(zoomLevel)
  }, [zoomRatio])
  const zoomOutAvailable = zoomLevels.some(zoomLevel => zoomLevel < zoomRatio)
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
    zoomInAvailable,
    zoomIn,
    zoomOutAvailable,
    zoomOut,
    isObjectSelected,
    moveObject,
    moveObjects,
    resizeObject,
    rotateObject,
    moveEndPoints,
  }

  return (
    <StrategyBoardCanvasContext.Provider value={contextValue}>
      {children}
    </StrategyBoardCanvasContext.Provider>
  )
}
