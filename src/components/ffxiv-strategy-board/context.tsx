'use client'

import { ReactNode, createContext, useState, useContext, useCallback } from 'react'
import { produce } from 'immer'
import {
  StrategyBoardScene,
  StrategyBoardBackground,
  StrategyBoardObject,
  StrategyBoardObjectType,
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
  modifyObject: (id: string, modification: (object: StrategyBoardObject) => void) => void
  modifyObjects: (modifications: { id: string, modification: (object: StrategyBoardObject) => void }[]) => void
  toggleObjectVisible: (id: string) => void
  toggleObjectLocked: (id: string) => void
  undoAvailable: boolean
  undo: () => void
  redoAvailable: boolean
  redo: () => void
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

  const [history, setHistory] = useState<StrategyBoardScene[]>(() => [scene])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0)

  const modifyScene = useCallback((modification: (scene: StrategyBoardScene) => void): void => {
    const updatedScene = produce(scene, scene => {
      modification(scene)
    })
    setHistory(history => history.slice(0, currentHistoryIndex + 1).concat([updatedScene]))
    setCurrentHistoryIndex(currentHistoryIndex => currentHistoryIndex + 1)
    onSceneChange?.(updatedScene)
  }, [scene, currentHistoryIndex, onSceneChange])

  const setName = useCallback((name: string): void => {
    modifyScene(scene => {
      scene.name = name
    })
  }, [modifyScene])
  const setBackground = useCallback((background: StrategyBoardBackground): void => {
    modifyScene(scene => {
      scene.background = background
    })
  }, [modifyScene])

  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>(() => [])

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
    modifyScene(scene => {
      objects.forEach(object => scene.objects.unshift(object))
    })
    const ids = objects.map(object => object.id)
    setSelectedObjectIds(ids)
    return ids
  }, [modifyScene])
  const addObject = useCallback((type: StrategyBoardObjectType, properties: StrategyBoardObjectProperties): string => {
    const [id] = addObjects([{ type, properties }])
    return id
  }, [addObjects])
  const deleteObjects = useCallback((ids: string[]): void => {
    if (!ids.length) return
    modifyScene(scene => {
      ids.forEach(id => {
        const index = scene.objects.findIndex(object => object.id === id)
        if (index < 0) return
        scene.objects.splice(index, 1)
      })
    })
    setSelectedObjectIds(selectedObjectIds => selectedObjectIds.filter(selectedObjectId => !ids.includes(selectedObjectId)))
  }, [modifyScene])
  const deleteObject = useCallback((id: string): void => {
    deleteObjects([id])
  }, [deleteObjects])

  const [copiedObjects, setCopiedObjects] = useState<Omit<StrategyBoardObject, 'id'>[]>(() => [])

  const copyObjects = useCallback((ids: string[]): void => {
    if (!ids.length) return
    const copiedObjects = scene.objects.filter(object => ids.includes(object.id)).map(object => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...copiedObject } = object
      return copiedObject
    }).reverse()
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
    modifyScene(scene => {
      const index = scene.objects.findIndex(object => object.id === id)
      if (index < 0 || index === newIndex) return
      const [object] = scene.objects.splice(index, 1)
      scene.objects.splice(newIndex, 0, object)
    })
  }, [modifyScene])

  const modifyObjects = useCallback((modifications: { id: string, modification: (object: StrategyBoardObject) => void }[]): void => {
    modifyScene(scene => {
      modifications.forEach(({ id, modification }) => {
        const object = scene.objects.find(object => object.id === id)
        if (!object) return
        modification(object)
      })
    })
  }, [modifyScene])
  const modifyObject = useCallback((id: string, modification: (object: StrategyBoardObject) => void): void => {
    modifyScene(scene => {
      const object = scene.objects.find(object => object.id === id)
      if (!object) return
      modification(object)
    })
  }, [modifyScene])

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

  const undoAvailable = currentHistoryIndex > 0
  const undo = useCallback((): void => {
    if (!undoAvailable) return
    setCurrentHistoryIndex(currentHistoryIndex - 1)
    const scene = history[currentHistoryIndex - 1]
    setSelectedObjectIds(selectedObjectIds => selectedObjectIds.filter(selectedObjectId => scene.objects.find(({ id }) => id === selectedObjectId)))
    onSceneChange?.(scene)
  }, [history, currentHistoryIndex, undoAvailable, onSceneChange])
  const redoAvailable = currentHistoryIndex < history.length - 1
  const redo = useCallback((): void => {
    if (!redoAvailable) return
    setCurrentHistoryIndex(currentHistoryIndex + 1)
    const scene = history[currentHistoryIndex + 1]
    setSelectedObjectIds(selectedObjectIds => selectedObjectIds.filter(selectedObjectId => scene.objects.find(({ id }) => id === selectedObjectId)))
    onSceneChange?.(scene)
  }, [history, currentHistoryIndex, redoAvailable, onSceneChange])

  const importFromShareCode = useCallback(async (shareCode: string): Promise<void> => {
    const scene = await shareCodeToScene(shareCode)
    setHistory([scene])
    setCurrentHistoryIndex(0)
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
    modifyObject,
    modifyObjects,
    toggleObjectVisible,
    toggleObjectLocked,
    undoAvailable,
    undo,
    redoAvailable,
    redo,
    importFromShareCode,
    exportToShareCode,
  }

  return (
    <StrategyBoardContext.Provider value={contextValue}>
      {children}
    </StrategyBoardContext.Provider>
  )
}
