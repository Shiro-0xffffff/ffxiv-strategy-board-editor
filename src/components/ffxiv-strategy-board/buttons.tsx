'use client'

import { MouseEventHandler, ChangeEventHandler, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Upload, Download, Share2, ClipboardCopy } from 'lucide-react'

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
            <Textarea className="min-h-32 font-mono break-all" placeholder="[stgy:...]" value={shareCode} onChange={handleShareCodeTextareaChange} />
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
            <Textarea className="min-h-32 font-mono break-all" readOnly value={shareCode} />
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

export function ShareButton() {
  const { exportToShareCode } = useStrategyBoard()

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [shareUrl, setShareUrl] = useState<string>('')

  const handleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    const shareCode = await exportToShareCode()
    const strippedShareCode = shareCode.match(/^\[stgy:([a-zA-Z0-9+-]+)]$/)![1].replaceAll('+', '_')
    const shareUrl = String(new URL(`/view/${strippedShareCode}`, window.location.origin))
    setShareUrl(shareUrl)
    setDialogOpen(true)
  }, [exportToShareCode])
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open)
  }, [])
  const handleCopyShareUrlToClipboardButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('战术板链接已复制到剪贴板')
  }, [shareUrl])

  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline" onClick={handleButtonClick}>
        <Share2 /> 分享
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon" onClick={handleButtonClick}>
        <Share2 />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>分享战术板</DialogTitle>
            <DialogDescription>复制链接以分享，点击链接可在其他网页窗口预览战术板查看效果</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="break-all">
              <a className="underline underline-offset-2" href={shareUrl} target="_blank">{shareUrl}</a>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-32 cursor-pointer" variant="outline" onClick={handleCopyShareUrlToClipboardButtonClick}>
              <ClipboardCopy /> 复制到剪贴板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
