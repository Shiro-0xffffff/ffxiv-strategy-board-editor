'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StrategyBoardProvider, StrategyBoardEditor, StrategyBoardName, ImportButton, ExportButton, ShareButton } from '@/components/ffxiv-strategy-board'
import { House } from 'lucide-react'
import { StrategyBoardScene, StrategyBoardBackground } from '@/lib/ffxiv-strategy-board'
import { debounce } from 'es-toolkit'

function TopBar() {
  return (
    <header className="h-16 border-b px-4 flex items-center justify-between bg-card">
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

export default function EditPage() {
  const [scene, setScene] = useState<StrategyBoardScene>({ name: '', background: StrategyBoardBackground.None, objects: [] })

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
  }, 300), [])

  const handleEditorSceneChange = useCallback((scene: StrategyBoardScene): void => {
    setScene(scene)
    saveSceneDraft(scene)
  }, [saveSceneDraft])

  return (
    <div className="w-screen h-screen flex flex-col">
      <StrategyBoardProvider scene={scene} onSceneChange={handleEditorSceneChange}>
        <TopBar />
        <StrategyBoardEditor />
      </StrategyBoardProvider>
    </div>
  )
}
