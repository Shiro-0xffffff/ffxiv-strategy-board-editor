'use client'

import { useTransition, useOptimistic } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StrategyBoardProvider,
  StrategyBoardName,
  ImportButton,
  ExportButton,
  ImportButtonSkeleton,
  ExportButtonSkeleton,
  StrategyBoardEditor,
  StrategyBoardEditorSkeleton,
} from '@/components/ffxiv-strategy-board'
import { ShareButton, ShareButtonSkeleton } from '@/components/share-button'
import { House } from 'lucide-react'
import { InferSelectModel } from 'drizzle-orm'
import { schema } from '@/db'
import { StrategyBoardScene } from '@/lib/ffxiv-strategy-board'

import { updateSceneContent } from './actions'

function TopBar() {
  const { encodedStrategyBoardId } = useParams<{ encodedStrategyBoardId: string }>()

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
        <ShareButton encodedStrategyBoardId={encodedStrategyBoardId} />
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

export function EditPageContent(props: { strategyBoard: InferSelectModel<typeof schema.strategyBoards> & { scenes: InferSelectModel<typeof schema.scenes>[] } }) {
  const { strategyBoard } = props

  const scene = strategyBoard.scenes[0].content

  const [isPending, startTransition] = useTransition()
  const [optimisticScene, updateOptimisticScene] = useOptimistic(scene, (scene, newScene: StrategyBoardScene) => newScene)

  const handleEditorSceneChange = (scene: StrategyBoardScene): void => {
    startTransition(async () => {
      updateOptimisticScene(scene)
      await updateSceneContent(strategyBoard.scenes[0].id, scene)
    })
  }

  return (
    <div className="w-full h-dvh flex flex-col">
      <title>{optimisticScene?.name ? `${optimisticScene.name} - FF14 战术板编辑器` : 'FF14 战术板编辑器'}</title>
      {optimisticScene ? (
        <StrategyBoardProvider scene={optimisticScene} onSceneChange={handleEditorSceneChange}>
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
