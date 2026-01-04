'use client'

import { MouseEventHandler, useCallback } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2 } from 'lucide-react'
import { StrategyBoardBackground } from '@/lib/ffxiv-strategy-board'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'
import { Button } from '@/components/ui/button'

function ScenePropertiesPanel() {
  const { scene, setBackground } = useStrategyBoard()

  const handleSceneBackgroundSelectValueChange = useCallback((value: string): void => {
    const background: StrategyBoardBackground = Number(value)
    setBackground(background)
  }, [setBackground])

  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">战术板属性</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="background">背景</FieldLabel>
              <FieldDescription>
                背景不可旋转缩放移动，如需调整可从左侧图形库另外添加场地
              </FieldDescription>
              <div className="*:w-full">
                <Select value={String(scene.background)} onValueChange={handleSceneBackgroundSelectValueChange}>
                  <SelectTrigger id="background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>战术板背景</SelectLabel>
                      {[...backgroundOptions.entries()].map(([background, backgroundOption]) => (
                        <SelectItem key={background} value={String(background)}>
                          {backgroundOption.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </FieldGroup>
        </div>
      </ScrollArea>
    </div>
  )
}

function ObjectPropertiesPanel() {
  const { scene, selectedObjectIds, deleteObjects } = useStrategyBoard()
  
  const selectedObjects = selectedObjectIds.map(id => scene.objects.find(object => object.id === id)).filter(object => !!object)

  const handleDeleteButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    deleteObjects(selectedObjectIds)
  }, [deleteObjects, selectedObjectIds])

  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图形属性</div>
        <div className="-my-1 flex gap-1">
          <Button className="cursor-pointer" variant="ghost" size="icon" onClick={handleDeleteButtonClick}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4">
          {selectedObjectIds.length > 1 ? (
            <div className="text-sm font-mono whitespace-pre">
              {JSON.stringify(selectedObjects, null, 2)}
            </div>
          ) : (
            <div className="text-sm font-mono whitespace-pre">
              {JSON.stringify(selectedObjects[0], null, 2)}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function PropertiesPanel() {
  const { selectedObjectIds } = useStrategyBoard()

  return selectedObjectIds.length ? (
    <ObjectPropertiesPanel />
  ) : (
    <ScenePropertiesPanel />
  )
}
