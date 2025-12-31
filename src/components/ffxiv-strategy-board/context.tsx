'use client'

import { ReactNode, createContext, useState, useContext, useMemo, useCallback } from 'react'
import { produce } from 'immer'
import { StrategyBoardScene, StrategyBoardObject, sceneToShareCode, shareCodeToScene } from '@/lib/ffxiv-strategy-board'

export interface StrategyBoardContextProps {
  scene: StrategyBoardScene
  importFromShareCode: (shareCode: string) => Promise<void>
  exportToShareCode: () => Promise<string>
  setName: (name: string) => void
  selectedObjectIndexes: number[]
  selectedObjects: StrategyBoardObject[]
  selectObjects: (indexes: number[]) => void
  toggleObjectVisible: (index: number) => void
  toggleObjectLocked: (index: number) => void
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

  const [selectedObjectIndexes, setSelectedObjectIndexes] = useState<number[]>([])
  const selectedObjects = useMemo(() => selectedObjectIndexes.map(index => scene.objects[index]), [scene.objects, selectedObjectIndexes])

  const selectObjects = useCallback((indexes: number[]): void => {
    setSelectedObjectIndexes(indexes)
  }, [])

  const toggleObjectVisible = useCallback((index: number): void => {
    onSceneChange?.(produce(scene, scene => {
      scene.objects[index].visible = !scene.objects[index].visible
    }))
  }, [scene, onSceneChange])
  const toggleObjectLocked = useCallback((index: number): void => {
    onSceneChange?.(produce(scene, scene => {
      scene.objects[index].locked = !scene.objects[index].locked
    }))
  }, [scene, onSceneChange])

  const contextValue: StrategyBoardContextProps = {
    scene,
    importFromShareCode,
    exportToShareCode,
    setName,
    selectedObjectIndexes,
    selectedObjects,
    selectObjects,
    toggleObjectVisible,
    toggleObjectLocked,
  }

  return (
    <StrategyBoardContext.Provider value={contextValue}>
      {children}
    </StrategyBoardContext.Provider>
  )
}
