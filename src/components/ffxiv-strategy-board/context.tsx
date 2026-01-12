'use client'

import { ReactNode, createContext, useState, useContext, useCallback } from 'react'
import { produce } from 'immer'
import {
  StrategyBoardScene,
  StrategyBoardBackground,
  StrategyBoardObject,
  StrategyBoardObjectType,
  normalizePosition,
  normalizeSize,
  normalizeWidth,
  normalizeHeight,
  createObject,
  sceneToShareCode,
  shareCodeToScene,
} from '@/lib/ffxiv-strategy-board'

export type StrategyBoardObjectProperties = Partial<Omit<StrategyBoardObject, 'id' | 'type'>>

export interface StrategyBoardContextProps {
  scene: StrategyBoardScene
  setName: (name: string) => void
  setBackground: (background: StrategyBoardBackground) => void
  selectedObjectIds: string[]
  selectObjects: (ids: string[]) => void
  toggleObjectSelected: (id: string) => void
  getObject: (id: string) => StrategyBoardObject | null
  addObject: (type: StrategyBoardObjectType, properties: StrategyBoardObjectProperties) => string
  addObjects: (objectsProperties: { type: StrategyBoardObjectType, properties: StrategyBoardObjectProperties }[]) => string[]
  deleteObject: (id: string) => void
  deleteObjects: (ids: string[]) => void
  cutObjects: (ids: string[]) => void
  copyObjects: (ids: string[]) => void
  pasteObjects: () => void
  reorderObject: (id: string, newIndex: number) => void
  toggleObjectVisible: (id: string) => void
  toggleObjectLocked: (id: string) => void
  setObjectPosition: (id: string, position: { x: number, y: number }) => void
  setObjectsPosition: (objectsPosition: { id: string, position: { x: number, y: number } }[]) => void
  resizeObject: (id: string, size: number | { width: number, height: number }) => void
  rotateObject: (id: string, rotation: number) => void
  moveEndPoints: (id: string, endPoint1: { x: number, y: number }, endPoint2: { x: number, y: number }) => void
  setObjectsProperties: (modifications: { id: string, modification: (object: StrategyBoardObject) => void }[]) => void
  importFromShareCode: (shareCode: string) => Promise<void>
  exportToShareCode: () => Promise<string>
}

const StrategyBoardContext = createContext<StrategyBoardContextProps | null>(null)

export function useStrategyBoard(): StrategyBoardContextProps {
  const context = useContext(StrategyBoardContext)
  if (!context) throw new Error('`useStrategyBoard` 需要在 `StrategyBoardProvider` 内部使用')
  return context
}

export interface StrategyBoardProviderProps {
  scene: StrategyBoardScene
  onSceneChange?: (scene: StrategyBoardScene) => void
  children?: ReactNode
}

export function StrategyBoardProvider(props: StrategyBoardProviderProps) {
  const { scene, onSceneChange, children } = props

  const setName = useCallback((name: string): void => {
    onSceneChange?.(produce(scene, scene => {
      scene.name = name
    }))
  }, [scene, onSceneChange])
  const setBackground = useCallback((background: StrategyBoardBackground): void => {
    onSceneChange?.(produce(scene, scene => {
      scene.background = background
    }))
  }, [scene, onSceneChange])

  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([])

  const selectObjects = useCallback((ids: string[]): void => {
    setSelectedObjectIds(ids)
  }, [])
  const toggleObjectSelected = useCallback((id: string): void => {
    setSelectedObjectIds(selectedObjectIds => {
      if (selectedObjectIds.includes(id)) {
        return selectedObjectIds.filter(selectedObjectId => selectedObjectId !== id)
      } else {
        return [...selectedObjectIds, id]
      }
    })
  }, [])

  const getObject = useCallback((id: string): StrategyBoardObject | null => {
    return scene.objects.find(object => object.id === id) ?? null
  }, [scene])

  const addObjects = useCallback((objectsProperties: { type: StrategyBoardObjectType, properties: StrategyBoardObjectProperties }[]): string[] => {
    if (!objectsProperties.length) return []
    const objects = objectsProperties.map(({ type, properties }) => ({ ...createObject(type), ...properties } as StrategyBoardObject))
    onSceneChange?.(produce(scene, scene => {
      objects.forEach(object => scene.objects.unshift(object))
    }))
    const ids = objects.map(object => object.id)
    setSelectedObjectIds(ids)
    return ids
  }, [scene, onSceneChange])
  const addObject = useCallback((type: StrategyBoardObjectType, properties: StrategyBoardObjectProperties): string => {
    const [id] = addObjects([{ type, properties }])
    return id
  }, [addObjects])
  const deleteObjects = useCallback((ids: string[]): void => {
    if (!ids.length) return
    onSceneChange?.(produce(scene, scene => {
      ids.forEach(id => {
        const index = scene.objects.findIndex(object => object.id === id)
        if (index < 0) return
        scene.objects.splice(index, 1)
      })
    }))
    setSelectedObjectIds(selectedObjectIds => selectedObjectIds.filter(selectedObjectId => !ids.includes(selectedObjectId)))
  }, [scene, onSceneChange])
  const deleteObject = useCallback((id: string): void => {
    deleteObjects([id])
  }, [deleteObjects])

  const [copiedObjects, setCopiedObjects] = useState<Omit<StrategyBoardObject, 'id'>[]>([])

  const copyObjects = useCallback((ids: string[]): void => {
    if (!ids.length) return
    const copiedObjects = ids.map(id => {
      const object = scene.objects.find(object => object.id === id)
      if (!object) return null
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...copiedObject } = object
      return copiedObject
    }).filter(copiedObject => !!copiedObject)
    setCopiedObjects(copiedObjects)
  }, [scene])
  const cutObjects = useCallback((ids: string[]): void => {
    if (!ids.length) return
    copyObjects(ids)
    deleteObjects(ids)
  }, [copyObjects, deleteObjects])
  const pasteObjects = useCallback((): void => {
    if (!copiedObjects.length) return
    addObjects(copiedObjects.map(({ type, ...properties }) => ({ type, properties })))
  }, [addObjects, copiedObjects])

  const reorderObject = useCallback((id: string, newIndex: number): void => {
    onSceneChange?.(produce(scene, scene => {
      const index = scene.objects.findIndex(object => object.id === id)
      if (index < 0 || index === newIndex) return
      const [object] = scene.objects.splice(index, 1)
      scene.objects.splice(newIndex, 0, object)
    }))
  }, [scene, onSceneChange])

  const modifyObject = useCallback((id: string, modification: (object: StrategyBoardObject) => void): void => {
    onSceneChange?.(produce(scene, scene => {
      const object = scene.objects.find(object => object.id === id)
      if (!object) return
      modification(object)
    }))
  }, [scene, onSceneChange])
  const toggleObjectVisible = useCallback((id: string): void => {
    modifyObject(id, object => {
      object.visible = !object.visible
    })
  }, [modifyObject])
  const toggleObjectLocked = useCallback((id: string): void => {
    modifyObject(id, object => {
      object.locked = !object.locked
    })
  }, [modifyObject])

  const setObjectsPosition = useCallback((objectsPosition: { id: string, position: { x: number, y: number } }[]): void => {
    onSceneChange?.(produce(scene, scene => {
      objectsPosition.forEach(({ id, position }) => {
        const object = scene.objects.find(object => object.id === id)
        if (!object) return
        object.position = normalizePosition(position)
      })
    }))
  }, [scene, onSceneChange])
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

  const setObjectsProperties = useCallback((modifications: { id: string, modification: (object: StrategyBoardObject) => void }[]): void => {
    onSceneChange?.(produce(scene, scene => {
      modifications.forEach(({ id, modification }) => {
        const object = scene.objects.find(object => object.id === id)
        if (!object) return
        modification(object)
      })
    }))
  }, [scene, onSceneChange])

  const importFromShareCode = useCallback(async (shareCode: string): Promise<void> => {
    const scene = await shareCodeToScene(shareCode)
    setSelectedObjectIds([])
    onSceneChange?.(scene)
  }, [onSceneChange])
  const exportToShareCode = useCallback(async (): Promise<string> => {
    const shareCode = await sceneToShareCode(scene)
    return shareCode
  }, [scene])

  const contextValue: StrategyBoardContextProps = {
    scene,
    setName,
    setBackground,
    selectedObjectIds,
    selectObjects,
    toggleObjectSelected,
    getObject,
    addObject,
    addObjects,
    cutObjects,
    copyObjects,
    pasteObjects,
    deleteObject,
    deleteObjects,
    reorderObject,
    toggleObjectVisible,
    toggleObjectLocked,
    setObjectPosition,
    setObjectsPosition,
    resizeObject,
    rotateObject,
    moveEndPoints,
    setObjectsProperties,
    importFromShareCode,
    exportToShareCode,
  }

  return (
    <StrategyBoardContext.Provider value={contextValue}>
      {children}
    </StrategyBoardContext.Provider>
  )
}
