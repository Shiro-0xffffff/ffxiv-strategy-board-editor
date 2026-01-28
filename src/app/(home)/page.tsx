import { FileInput, FilePlus } from 'lucide-react'

import { ImportPanel, CreatePanel } from './components'

export default function HomePage() {
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
