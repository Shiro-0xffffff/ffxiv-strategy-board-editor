'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StrategyBoardProvider, StrategyBoardViewer, StrategyBoardName, ExportButton } from '@/components/ffxiv-strategy-board'
import { EditButton, ShareButton } from '@/components/top-bar'
import { House } from 'lucide-react'
import { InferSelectModel } from 'drizzle-orm'
import { schema } from '@/db'

function TopBar(props: { encodedStrategyBoardId: string }) {
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
            <EditButton encodedStrategyBoardId={encodedStrategyBoardId} />
            <ExportButton />
            <ShareButton encodedStrategyBoardId={encodedStrategyBoardId} />
          </div>
        </div>
      </div>
    </header>
  )
}

export function ViewPage(props: { encodedStrategyBoardId: string, strategyBoard: InferSelectModel<typeof schema.strategyBoards> & { scenes: InferSelectModel<typeof schema.scenes>[] } }) {
  const { encodedStrategyBoardId, strategyBoard } = props

  const scene = strategyBoard.scenes[0].content

  return (
    <div className="min-h-dvh flex flex-col">
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
