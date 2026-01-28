'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StrategyBoardProvider,
  StrategyBoardName,
  ImportButton,
  ExportButton,
  ShareButton,
  ImportButtonSkeleton,
  ExportButtonSkeleton,
  ShareButtonSkeleton,
  StrategyBoardEditor,
  StrategyBoardEditorSkeleton,
} from '@/components/ffxiv-strategy-board'
import { House } from 'lucide-react'
import { StrategyBoardScene, StrategyBoardBackground } from '@/lib/ffxiv-strategy-board'
import { debounce } from 'es-toolkit'

function TopBar() {
  return (
    <header className="h-16 border-b px-4 flex items-center justify-between gap-2 bg-card">
      <div className="flex-1 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <House className="size-5" />
          </Link>
        </Button>
        <Separator orientation="vertical" />
        <StrategyBoardName />
      </div>
      <div className="flex items-center gap-2">
        <ImportButton />
        <ExportButton />
        <ShareButton />
      </div>
    </header>
  )
}

function TopBarSkeleton() {
  return (
    <header className="h-16 border-b px-4 flex items-center justify-between gap-2 bg-card">
      <div className="flex-1 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <House className="size-5" />
          </Link>
        </Button>
        <Separator orientation="vertical" />
        <Skeleton className="mx-2 w-full max-w-80 h-6" />
      </div>
      <div className="flex items-center gap-2">
        <ImportButtonSkeleton />
        <ExportButtonSkeleton />
        <ShareButtonSkeleton />
      </div>
    </header>
  )
}

export function EditPageContent() {
  const [scene, setScene] = useState<StrategyBoardScene | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const scene: StrategyBoardScene = JSON.parse(window.sessionStorage.getItem('scene')!)
      if (scene) {
        Promise.resolve().then(() => setScene(scene))
        return
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {}
    Promise.resolve().then(() => setScene({ name: '未命名战术板', background: StrategyBoardBackground.None, objects: [] }))
  }, [])

  const saveSceneDraft = useMemo(() => debounce((scene: StrategyBoardScene) => {
    window.sessionStorage.setItem('scene', JSON.stringify(scene))
  }, 500), [])

  const handleEditorSceneChange = useCallback((scene: StrategyBoardScene): void => {
    setScene(scene)
    saveSceneDraft(scene)
  }, [saveSceneDraft])

  return (
    <div className="w-full h-dvh flex flex-col">
      <title>{scene?.name ? `${scene.name} - FF14 战术板编辑器` : 'FF14 战术板编辑器'}</title>
      {scene ? (
        <StrategyBoardProvider scene={scene} onSceneChange={handleEditorSceneChange}>
          <TopBar />
          <StrategyBoardEditor />
        </StrategyBoardProvider>
      ) : (
        <>
          <TopBarSkeleton />
          <StrategyBoardEditorSkeleton />
        </>
      )}
    </div>
  )
}
