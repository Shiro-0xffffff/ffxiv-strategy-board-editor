'use client'

import { MouseEventHandler, useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PointerSensor, DragEndEvent, DndContext, DragOverlay, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react'
import { cn, ffxivImageUrl } from '@/lib/utils'
import { StrategyBoardBackground, StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'

import { backgroundOptions, objectLibrary, objectLibraryGroups } from './constants'
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
                        <Image className="size-10" src={ffxivImageUrl(item.icon)} alt={item.abbr} width={80} height={80} />
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
  const { scene, setBackground, selectedObjects } = useStrategyBoard()

  const handleSceneBackgroundSelectValueChange = useCallback((background: StrategyBoardBackground) => {
    setBackground(background)
  }, [setBackground])

  return selectedObjects.length ? (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图形属性</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4">
          {selectedObjects.length > 1 ? (
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
  ) : (
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
                <Select value={scene.background} onValueChange={handleSceneBackgroundSelectValueChange}>
                  <SelectTrigger id="background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>战术板背景</SelectLabel>
                      {[...backgroundOptions.entries()].map(([background, backgroundOption]) => (
                        <SelectItem key={background} value={background}>
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

function LayersPanelLayer(props: { id: string }) {
  const { id } = props

  const { selectedObjectIds, selectObjects, getObject, toggleObjectVisible, toggleObjectLocked } = useStrategyBoard()

  const object = getObject(id)!
  const objectLibraryItem = objectLibrary.get(object.type)!
  const selected = selectedObjectIds.includes(id)

  const handleLayerClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    selectObjects([id])
  }, [id, selectObjects])

  const handleToggleLockedButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
    event.stopPropagation()
    toggleObjectLocked(id)
  }, [id, toggleObjectLocked])
  const handleToggleVisibleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
    event.stopPropagation()
    toggleObjectVisible(id)
  }, [id, toggleObjectVisible])

  return (
    <div
      className={cn('rounded p-2 flex items-center gap-2 cursor-pointer transition-colors', {
        'hover:bg-muted': !selected,
        'inset-ring-1 ring-primary bg-[color-mix(in_oklab,var(--primary)_20%,var(--card))]': selected,
      })}
      onClick={handleLayerClick}
    >
      <Image className="size-10" src={ffxivImageUrl(objectLibraryItem.icon)} alt={objectLibraryItem.abbr} width={80} height={80} />
      <div className="flex-1 w-0 text-sm truncate">
        {object.type === StrategyBoardObjectType.Text ? object.content : objectLibraryItem.name}
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

function SortableLayersPanelLayer(props: { id: string }) {
  const { id } = props

  const { isDragging, setNodeRef, transform, transition, attributes, listeners } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn({ 'invisible': isDragging })}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <LayersPanelLayer id={id} />
    </div>
  )
}

function LayersPanel() {
  const { scene, selectObjects, reorderObject } = useStrategyBoard()

  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  )

  const handleDragStart = useCallback((event: DragEndEvent): void => {
    const { active } = event
    const id = active.id as string
    selectObjects([id])
    setDraggingObjectId(id)
  }, [selectObjects])
  const handleDragEnd = useCallback((event: DragEndEvent): void => {
    const { active, over } = event
    const id = active.id as string
    const targetIndex = scene.objects.findIndex(object => object.id === over?.id)
    reorderObject(id, targetIndex)
    setDraggingObjectId(null)
  }, [reorderObject, scene.objects])

  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图层</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-2 flex flex-col gap-0.5">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={scene.objects} strategy={verticalListSortingStrategy}>
              {scene.objects.map(({ id }) => (
                <SortableLayersPanelLayer key={id} id={id} />
              ))}
              <DragOverlay className="**:cursor-grabbing">
                {draggingObjectId && (
                  <LayersPanelLayer id={draggingObjectId} />
                )}
              </DragOverlay>
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}

function CanvasArea() {
  const { selectObjects } = useStrategyBoard()

  const handleBackgroundClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    selectObjects([])
  }, [selectObjects])
  const handleCanvasContainerClick = useCallback<MouseEventHandler<HTMLDivElement>>(event => {
    event.stopPropagation()
  }, [])

  return (
    <div className="size-full flex flex-col bg-muted/30 overflow-auto" onClick={handleBackgroundClick}>
      <div className="flex-1 min-w-max flex flex-col">
        <div className="flex-1 p-12 flex items-center justify-center">
          <div className="shadow-xl" onClick={handleCanvasContainerClick}>
            <StrategyBoardCanvas />
          </div>
        </div>
        <div className="min-w-0 min-h-0 p-4">
          <div className="text-center text-balance text-xs text-muted-foreground/15">
            <p>FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.</p>
            <p>FINAL FANTASY XI © 2002 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</p>
          </div>
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
