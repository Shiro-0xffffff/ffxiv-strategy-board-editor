'use client'

import { MouseEventHandler, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StrategyBoardObject } from '@/lib/ffxiv-strategy-board'

import { objectLibrary, objectLibraryGroups } from './constants'
import { useStrategyBoard } from './context'
import { StrategyBoardCanvas } from './canvas'

function ObjectLibraryPanel() {
  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图形库</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4">
          {objectLibraryGroups.map((group, index) => (
            <div key={index} className="">
              {group.name !== '' && (
                <div className="mt-2 py-2 flex items-center justify-between">
                  <div className="text-sm">{group.name}</div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((row, index) => (
                  <div key={index} className="flex flex-wrap gap-1">
                    {row.map((item, index) => (
                      <div
                        key={index}
                        className="size-10 rounded-sm cursor-grab"
                      >
                        <div className="size-10 border rounded-sm flex items-center justify-center">
                          <div className="text-xs/4 text-center text-balance text-muted-foreground">{item.icon}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function PropertiesPanel() {
  const { scene, selectedObject } = useStrategyBoard()

  return selectedObject ? (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图形属性</div>
      </div>
      <div className="flex-1 px-4 pb-4">
        <div className="text-sm font-mono whitespace-pre">
          {JSON.stringify(selectedObject, null, 2)}
        </div>
      </div>
    </div>
  ) : (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">战术板属性</div>
      </div>
      <div className="flex-1 px-4 pb-4">
        <div className="text-sm font-mono whitespace-pre">
          {JSON.stringify({ ...scene, objects: null }, null, 2)}
        </div>
      </div>
    </div>
  )
}

function LayersPanelLayer(props: { object: StrategyBoardObject, index: number }) {
  const { object, index } = props

  const { selectedObjectIndex, selectObject, toggleObjectVisible, toggleObjectLocked } = useStrategyBoard()

  const objectLibraryItem = objectLibrary.get(object.type)!

  const handleLayerClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    selectObject(index)
  }, [index, selectObject])

  const handleToggleLockedButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
    event.stopPropagation()
    toggleObjectLocked(index)
  }, [index, toggleObjectLocked])
  const handleToggleVisibleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
    event.stopPropagation()
    toggleObjectVisible(index)
  }, [index, toggleObjectVisible])

  return (
    <div
      className={cn('-mx-2 rounded p-2 flex items-center gap-2 hover:bg-muted cursor-pointer transition-colors', {
        'hover:bg-muted': index !== selectedObjectIndex,
        'z-10 inset-ring-1 ring-primary bg-primary/20': index === selectedObjectIndex,
      })}
      onClick={handleLayerClick}
    >
      <div className="size-10 border rounded-sm flex items-center justify-center">
        <div className="text-xs/4 text-center text-balance text-muted-foreground">{objectLibraryItem.icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">
          {objectLibraryItem.name}
        </div>
      </div>
      <div className="flex gap-1">
        <Button className="cursor-pointer" variant="ghost" size="icon-sm" onClick={handleToggleLockedButtonClick}>
          {object.locked ? (
            <Lock />
          ) : (
            <Unlock />
          )}
        </Button>
        <Button className="cursor-pointer" variant="ghost" size="icon-sm" onClick={handleToggleVisibleButtonClick}>
          {object.visible ? (
            <Eye />
          ) : (
            <EyeOff />
          )}
        </Button>
      </div>
    </div>
  )
}

function LayersPanel() {
  const { scene } = useStrategyBoard()

  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图层</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4 flex flex-col gap-0.5">
          {scene.objects.map((object, index) => (
            <LayersPanelLayer key={index} object={object} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function CanvasArea() {
  const { selectObject } = useStrategyBoard()

  const handleBackgroundClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    selectObject(null)
  }, [selectObject])
  const handleCanvasContainerClick = useCallback<MouseEventHandler<HTMLDivElement>>(event => {
    event.stopPropagation()
  }, [])

  return (
    <div className="size-full flex flex-col bg-muted/30 overflow-hidden" onClick={handleBackgroundClick}>
      <div className="flex-1 flex items-center justify-center">
        <div className="shadow-xl" onClick={handleCanvasContainerClick}>
          <StrategyBoardCanvas />
        </div>
      </div>
      <div className="p-4">
        <div className="text-center text-balance text-xs text-muted-foreground/15">
          <p>FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.</p>
          <p>FINAL FANTASY XI © 2002 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}

export function StrategyBoardEditor() {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      <div className="w-110 border-r flex flex-col bg-card">
        <ObjectLibraryPanel />
      </div>
      <div className="flex-1 min-w-0">
        <CanvasArea />
      </div>
      <div className="w-80 border-l flex flex-col bg-card">
        <div className="h-120">
          <PropertiesPanel />
        </div>
        <div className="border-b" />
        <div className="flex-1 min-h-0">
          <LayersPanel />
        </div>
      </div>
    </div>
  )
}
