'use client'

import { MouseEventHandler, ChangeEventHandler, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { FileInput, FilePlus, Plus } from 'lucide-react'
import { encodeUUID } from '@/lib/utils'

import { importStrategyBoard, createStrategyBoard } from './actions'

function ImportPanel() {
  const router = useRouter()

  const [shareCode, setShareCode] = useState<string>('')

  const handleImportShareCodeTextareaChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setShareCode(target.value)
  }
  const handleDialogImportButtonClick: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const strategyBoardId = await importStrategyBoard(shareCode)
      const encodedStrategyBoardId = encodeUUID(strategyBoardId)
      router.push(`/edit/${encodedStrategyBoardId}`)
    } catch (err) {
      const detailedMessage = (err as Error).message
      toast.error(`导入失败：${detailedMessage}`)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        className="flex-1 h-9 font-mono"
        placeholder="[stgy:...]"
        value={shareCode}
        onChange={handleImportShareCodeTextareaChange}
      />
      <Button className="w-30 cursor-pointer" size="lg" onClick={handleDialogImportButtonClick}>
        <FileInput /> 导入战术板
      </Button>
    </div>
  )
}

function CreatePanel() {
  const router = useRouter()

  const handleCreateEmptyStrategyBoardClick: MouseEventHandler<HTMLDivElement> = async () => {
    const strategyBoardId = await createStrategyBoard()
    const encodedStrategyBoardId = encodeUUID(strategyBoardId)
    router.push(`/edit/${encodedStrategyBoardId}`)
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card
        className="group hover:ring-primary/50 hover:shadow-lg cursor-pointer transition-all"
        onClick={handleCreateEmptyStrategyBoardClick}
      >
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center gap-2">
            <Plus className="size-12 text-primary" strokeWidth={1} />
            <p>新建空白战术板</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="h-16 border-b">
        <div className="container mx-auto p-4">
          <div className="mx-auto max-w-4xl flex items-center justify-between">
            {/* TODO */}
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto container px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-16">
          <section>
            <div className="text-center text-balance">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">开始创建战术板</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                从分享码导入战术板，或从模板快速创建新的战术板
              </p>
            </div>
          </section>
          <section className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="size-14 ring-1 ring-foreground/10 rounded-lg flex items-center justify-center bg-card">
                <FileInput className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold">从分享码导入</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  在游戏内战术板右键菜单「分享-生成分享码」可生成分享码，粘贴到此即可导入
                </p>
              </div>
            </div>
            <ImportPanel />
          </section>
          <section className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="size-14 ring-1 ring-foreground/10 rounded-lg flex items-center justify-center bg-card">
                <FilePlus className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold">创建新战术板</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  从空白的新战术板开始绘制，也可以选择预设模板来快速创建
                </p>
              </div>
            </div>
            <CreatePanel />
          </section>
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
    </div>
  )
}
