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

export interface StrategyBoardContextProps {
  scene: StrategyBoardScene
  setName: (name: string) => void
  setBackground: (background: StrategyBoardBackground) => void
  selectedObjectIds: string[]
  selectObjects: (ids: string[]) => void
  toggleObjectSelected: (id: string) => void
  getObject: (id: string) => StrategyBoardObject | null
  addObject: (type: StrategyBoardObjectType, position: { x: number, y: number }) => void
  deleteObject: (id: string) => void
  deleteObjects: (ids: string[]) => void
  reorderObject: (id: string, newIndex: number) => void
  toggleObjectVisible: (id: string) => void
  toggleObjectLocked: (id: string) => void
  setObjectPosition: (id: string, position: { x: number, y: number }) => void
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

  const addObject = useCallback((type: StrategyBoardObjectType, position: { x: number, y: number }): void => {
    const object = createObject(type, position)
    onSceneChange?.(produce(scene, scene => {
      scene.objects.unshift(object)
    }))
    setSelectedObjectIds([object.id])
  }, [scene, onSceneChange])
  const deleteObjects = useCallback((ids: string[]): void => {
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
  const setObjectPosition = useCallback((id: string, position: { x: number, y: number }): void => {
    modifyObject(id, object => {
      object.position = position
    })
  }, [modifyObject])

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
    deleteObject,
    deleteObjects,
    reorderObject,
    toggleObjectVisible,
    toggleObjectLocked,
    setObjectPosition,
    importFromShareCode,
    exportToShareCode,
  }

  return (
    <StrategyBoardContext.Provider value={contextValue}>
      {children}
    </StrategyBoardContext.Provider>
  )
}
