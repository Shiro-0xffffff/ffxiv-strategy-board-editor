'use client'

import { MouseEventHandler, ChangeEventHandler, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Upload, Download, ClipboardCopy } from 'lucide-react'

import { useStrategyBoard } from './context'

export function ImportButton() {
  const { importFromShareCode } = useStrategyBoard()

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [shareCode, setShareCode] = useState<string>('')

  const handleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    setShareCode('')
    setDialogOpen(true)
  }, [])
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open)
  }, [])
  const handleShareCodeTextareaChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(({ target }) => {
    setShareCode(target.value)
  }, [])
  const handleDialogButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    await importFromShareCode(shareCode)
    setDialogOpen(false)
  }, [importFromShareCode, shareCode])

  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline" onClick={handleButtonClick}>
        <Download /> 导入
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon" onClick={handleButtonClick}>
        <Download />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>从分享码导入</DialogTitle>
            <DialogDescription>在游戏内战术板右键菜单「分享-生成分享码」可生成分享码，粘贴到此即可导入</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea className="min-h-32 max-h-64 font-mono break-all" placeholder="[stgy:...]" value={shareCode} onChange={handleShareCodeTextareaChange} />
          </div>
          <DialogFooter>
            <Button className="w-20 cursor-pointer" onClick={handleDialogButtonClick}>
              <Download /> 导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ImportButtonSkeleton() {
  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline">
        <Download /> 导入
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon">
        <Download />
      </Button>
    </>
  )
}

export function ExportButton() {
  const { exportToShareCode } = useStrategyBoard()

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [shareCode, setShareCode] = useState<string>('')

  const handleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    const shareCode = await exportToShareCode()
    setShareCode(shareCode)
    setDialogOpen(true)
  }, [exportToShareCode])
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open)
  }, [])
  const handleCopyShareCodeToClipboardButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    await navigator.clipboard.writeText(shareCode)
    toast.success('分享码已复制到剪贴板')
  }, [shareCode])

  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline" onClick={handleButtonClick}>
        <Upload /> 导出
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon" onClick={handleButtonClick}>
        <Upload />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>导出为分享码</DialogTitle>
            <DialogDescription>在游戏内点击「新建战术板-输入分享码」即可将战术板导入到游戏</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea className="min-h-32 max-h-64 font-mono break-all" readOnly value={shareCode} />
          </div>
          <DialogFooter>
            <Button className="w-32 cursor-pointer" variant="outline" onClick={handleCopyShareCodeToClipboardButtonClick}>
              <ClipboardCopy /> 复制到剪贴板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ExportButtonSkeleton() {
  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline">
        <Upload /> 导出
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon">
        <Upload />
      </Button>
    </>
  )
}
