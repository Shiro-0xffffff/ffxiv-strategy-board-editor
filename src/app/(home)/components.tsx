'use client'

import { MouseEventHandler, ChangeEventHandler, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { FileInput, Plus } from 'lucide-react'
import { shareCodeToScene } from '@/lib/ffxiv-strategy-board'

export function ImportPanel() {
  const router = useRouter()

  const [shareCode, setShareCode] = useState<string>('')

  const handleImportShareCodeTextareaChange = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target }) => {
    setShareCode(target.value)
  }, [])
  const handleDialogImportButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    try {
      const scene = await shareCodeToScene(shareCode)
      window.sessionStorage.setItem('scene', JSON.stringify(scene))
      router.push('/edit')
    } catch (err) {
      const detailedMessage = (err as Error).message
      toast.error(`导入失败：${detailedMessage}`)
    }
  }, [shareCode, router])

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

export function CreatePanel() {
  const router = useRouter()

  const handleCreateEmptyStrategyBoardClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    window.sessionStorage.removeItem('scene')
    router.push('/edit')
  }, [router])

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
