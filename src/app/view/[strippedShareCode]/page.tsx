'use client'

import { MouseEventHandler, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StrategyBoardProvider, StrategyBoardViewer, StrategyBoardName, ExportButton, ShareButton } from '@/components/ffxiv-strategy-board'
import { House, Pencil } from 'lucide-react'
import { StrategyBoardScene, StrategyBoardBackground, shareCodeToScene } from '@/lib/ffxiv-strategy-board'

function TopBar() {
  const { strippedShareCode } = useParams<{ strippedShareCode: string }>()

  const router = useRouter()

  const handleEditButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    const shareCode = `[stgy:${strippedShareCode.replaceAll('_', '+')}]`
    const scene = await shareCodeToScene(shareCode)
    window.sessionStorage.setItem('scene', JSON.stringify(scene))
    router.push('/edit')
  }, [strippedShareCode, router])

  return (
    <header className="h-16 border-b bg-card">
      <div className="mx-auto container p-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <House className="size-5" />
              </Link>
            </Button>
            <Separator orientation="vertical" />
            <StrategyBoardName readOnly />
          </div>
          <div className="flex items-center gap-2">
            <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline" onClick={handleEditButtonClick}>
              <Pencil /> 编辑
            </Button>
            <Button className="sm:hidden cursor-pointer" variant="outline" size="icon" onClick={handleEditButtonClick}>
              <Pencil />
            </Button>
            <ExportButton />
            <ShareButton />
          </div>
        </div>
      </div>
    </header>
  )
}

export default function ViewPage() {
  const { strippedShareCode } = useParams<{ strippedShareCode: string }>()

  const [scene, setScene] = useState<StrategyBoardScene>({ name: '', background: StrategyBoardBackground.None, objects: [] })

  useEffect(() => {
    const shareCode = `[stgy:${strippedShareCode.replaceAll('_', '+')}]`
    shareCodeToScene(shareCode).then(scene => setScene(scene))
  }, [strippedShareCode])

  return (
    <div className="min-h-screen flex flex-col">
      <StrategyBoardProvider scene={scene}>
        <TopBar />
        <main className="flex-1 mx-auto container px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <StrategyBoardViewer />
          </div>
        </main>
        <footer className="mt-24 border-t">
          <div className="mx-auto container p-4">
            <div className="text-center text-balance text-sm text-muted-foreground">
              <p>FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.</p>
              <p>FINAL FANTASY XI © 2002 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </StrategyBoardProvider>
    </div>
  )
}
