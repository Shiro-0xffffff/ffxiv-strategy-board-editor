'use client'

import { MouseEventHandler, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Share2, ClipboardCopy } from 'lucide-react'

export function ShareButton(props: { encodedStrategyBoardId: string }) {
  const { encodedStrategyBoardId } = props

  const shareUrl = typeof window !== 'undefined' ? String(new URL(`/view/${encodedStrategyBoardId}`, window.location.origin)) : `/view/${encodedStrategyBoardId}`

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = async () => {
    setDialogOpen(true)
  }
  const handleDialogOpenChange = (open: boolean): void => {
    setDialogOpen(open)
  }
  const handleCopyShareUrlToClipboardButtonClick: MouseEventHandler<HTMLButtonElement> = async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('战术板链接已复制到剪贴板')
  }

  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline" onClick={handleButtonClick}>
        <Share2 /> 分享
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon" onClick={handleButtonClick}>
        <Share2 />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>分享战术板</DialogTitle>
            <DialogDescription>复制链接以分享，点击链接可在其他网页窗口预览战术板查看效果</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="line-clamp-6 break-all">
              <a className="underline underline-offset-2" href={shareUrl} target="_blank">
                {shareUrl}
              </a>
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

export function ShareButtonSkeleton() {
  return (
    <>
      <Button className="hidden sm:flex w-20 cursor-pointer" variant="outline">
        <Share2 /> 分享
      </Button>
      <Button className="sm:hidden cursor-pointer" variant="outline" size="icon">
        <Share2 />
      </Button>
    </>
  )
}
