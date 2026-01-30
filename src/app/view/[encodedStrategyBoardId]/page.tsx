import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StrategyBoardProvider, StrategyBoardViewer, StrategyBoardName, ExportButton } from '@/components/ffxiv-strategy-board'
import { ShareButton } from '@/components/share-button'
import { House, Pencil } from 'lucide-react'
import { decodeUUID } from '@/lib/utils'

import { getStrategyBoard } from './actions'

export function TopBar(props: { encodedStrategyBoardId: string }) {
  const { encodedStrategyBoardId } = props

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
            <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline" asChild>
              <Link href={`/edit/${encodedStrategyBoardId}`}>
                <Pencil /> 编辑
              </Link>
            </Button>
            <Button className="sm:hidden cursor-pointer" variant="outline" size="icon" asChild>
              <Link href={`/edit/${encodedStrategyBoardId}`}>
                <Pencil />
              </Link>
            </Button>
            <ExportButton />
            <ShareButton encodedStrategyBoardId={encodedStrategyBoardId} />
          </div>
        </div>
      </div>
    </header>
  )
}

export const metadata: Metadata = {
  title: null,
}

export default async function ViewPage({ params }: { params: Promise<{ encodedStrategyBoardId: string }> }) {
  const { encodedStrategyBoardId } = await params
  
  const strategyBoardId = decodeUUID(encodedStrategyBoardId)
  const strategyBoard = await getStrategyBoard(strategyBoardId)
  if (!strategyBoard) return null

  const scene = strategyBoard.scenes[0].content

  return (
    <div className="min-h-dvh flex flex-col">
      <title>{scene?.name ? `${scene.name} - FF14 战术板编辑器` : 'FF14 战术板编辑器'}</title>
      <StrategyBoardProvider scene={scene}>
        <TopBar encodedStrategyBoardId={encodedStrategyBoardId} />
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
