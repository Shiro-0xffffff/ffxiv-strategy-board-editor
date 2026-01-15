'use client'

import { ReactNode, createContext, useState, useContext, useCallback } from 'react'
import { StrategyBoardObjectType, normalizePosition, normalizeSize, normalizeWidth, normalizeHeight } from '@/lib/ffxiv-strategy-board'

import { useStrategyBoard } from '../context'

const defaultZoomRatio = 0.2

export interface StrategyBoardCanvasContextProps {
  preview: boolean
  zoomRatio: number
  isObjectSelected: (id: string) => boolean
  setObjectPosition: (id: string, position: { x: number, y: number }) => void
  setObjectsPosition: (objectsPosition: { id: string, position: { x: number, y: number } }[]) => void
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

  const [zoomRatio] = useState<number>(defaultZoomRatio)

  const isObjectSelected = useCallback((id: string): boolean => {
    return !preview && selectedObjectIds.includes(id)
  }, [preview, selectedObjectIds])

  const setObjectsPosition = useCallback((objectsPosition: { id: string, position: { x: number, y: number } }[]): void => {
    modifyObjects(objectsPosition.map(({ id, position }) => ({ id, modification: object => {
      object.position = normalizePosition(position)
    }})))
  }, [modifyObjects])
  const setObjectPosition = useCallback((id: string, position: { x: number, y: number }): void => {
    setObjectsPosition([{ id, position }])
  }, [setObjectsPosition])

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
          if (rotation > 180) {
            object.rotation = Math.round((rotation + 180) % 360 - 180)
            break
          }
          if (rotation < -180) {
            object.rotation = Math.round((rotation - 180) % 360 + 180)
            break
          }
          object.rotation = Math.round(rotation)
      }
    })
  }, [modifyObject])

  const moveEndPoints = useCallback((id: string, endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }): void => {
    modifyObject(id, object => {
      if (object.type !== StrategyBoardObjectType.Line) return
      object.position.x = Math.round(object.position.x + (endPoint1.x + endPoint2.x) / 2)
      object.position.y = Math.round(object.position.y + (endPoint1.y + endPoint2.y) / 2)
      object.endPointOffset.x = Math.round((endPoint2.x - endPoint1.x) / 2)
      object.endPointOffset.y = Math.round((endPoint2.y - endPoint1.y) / 2)
    })
  }, [modifyObject])

  const contextValue: StrategyBoardCanvasContextProps = {
    preview,
    zoomRatio,
    isObjectSelected,
    setObjectPosition,
    setObjectsPosition,
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
