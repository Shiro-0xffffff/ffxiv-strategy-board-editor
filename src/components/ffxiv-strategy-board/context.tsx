'use client'

import { ReactNode, createContext, useState, useContext, useMemo, useCallback } from 'react'
import { produce } from 'immer'
import { StrategyBoardScene, StrategyBoardBackground, StrategyBoardObject, sceneToShareCode, shareCodeToScene } from '@/lib/ffxiv-strategy-board'

export interface StrategyBoardContextProps {
  scene: StrategyBoardScene
  importFromShareCode: (shareCode: string) => Promise<void>
  exportToShareCode: () => Promise<string>
  setName: (name: string) => void
  setBackground: (background: StrategyBoardBackground) => void
  selectedObjectIds: string[]
  selectedObjects: StrategyBoardObject[]
  selectObjects: (ids: string[]) => void
  getObject: (id: string) => StrategyBoardObject | null
  reorderObject: (id: string, newIndex: number) => void
  toggleObjectVisible: (id: string) => void
  toggleObjectLocked: (id: string) => void
  setObjectPosition: (id: string, position: { x: number, y: number }) => void
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

  const importFromShareCode = useCallback(async (shareCode: string): Promise<void> => {
    const scene = await shareCodeToScene(shareCode)
    onSceneChange?.(scene)
  }, [onSceneChange])
  const exportToShareCode = useCallback(async (): Promise<string> => {
    const shareCode = await sceneToShareCode(scene)
    return shareCode
  }, [scene])

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
  const selectedObjects = useMemo(() => (
    selectedObjectIds.map(id => scene.objects.find(object => object.id === id)).filter(object => !!object)
  ), [scene.objects, selectedObjectIds])

  const selectObjects = useCallback((ids: string[]): void => {
    setSelectedObjectIds(ids)
  }, [])

  const getObject = useCallback((id: string): StrategyBoardObject | null => {
    return scene.objects.find(object => object.id === id) ?? null
  }, [scene])

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

  const contextValue: StrategyBoardContextProps = {
    scene,
    importFromShareCode,
    exportToShareCode,
    setName,
    setBackground,
    selectedObjectIds,
    selectedObjects,
    selectObjects,
    getObject,
    reorderObject,
    toggleObjectVisible,
    toggleObjectLocked,
    setObjectPosition,
  }

  return (
    <StrategyBoardContext.Provider value={contextValue}>
      {children}
    </StrategyBoardContext.Provider>
  )
}
