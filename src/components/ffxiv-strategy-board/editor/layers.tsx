'use client'

import { MouseEventHandler, PointerEventHandler, useState, useRef, useEffect, useCallback, useId } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger, ContextMenu, ContextMenuGroup, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { PointerSensor, DragStartEvent, DragEndEvent, DndContext, DragOverlay, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { Undo2, Redo2, Scissors, Copy, ClipboardPaste, CopyCheck, Trash2, Lock, Unlock, Eye, EyeOff } from 'lucide-react'
import { StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'
import { cn, isMac, ffxivImageUrl } from '@/lib/utils'

import { objectLibrary } from '../constants'
import { useStrategyBoard } from '../context'

function Layer(props: { id: string }) {
  const { id } = props

  const { selectedObjectIds, selectObjects, deselectObject, getObject, toggleObjectVisible, toggleObjectLocked } = useStrategyBoard()

  const object = getObject(id)!
  const objectLibraryItem = objectLibrary.get(object.type)!
  const selected = selectedObjectIds.includes(id)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected) return
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selected])

  const [selectedObjectOnPointerDown, setSelectedObjectOnPointerDown] = useState<boolean>(false)

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(event => {
    setSelectedObjectOnPointerDown(false)
    if (selectedObjectIds.includes(id)) return
    if (event.shiftKey || event.ctrlKey) {
      selectObjects([...selectedObjectIds, id])
    } else {
      selectObjects([id])
    }
    setSelectedObjectOnPointerDown(true)
  }, [id, selectedObjectIds, selectObjects])
  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(event => {
    setSelectedObjectOnPointerDown(false)
    if (selectedObjectOnPointerDown) return
    if (event.button === 2) return
    if (event.shiftKey || event.ctrlKey) {
      deselectObject(id)
    } else {
      selectObjects([id])
    }
  }, [id, selectedObjectOnPointerDown, selectObjects, deselectObject])

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
      ref={ref}
      className={cn('rounded p-2 flex items-center gap-2 cursor-pointer select-none transition-colors', {
        'hover:bg-muted': !selected,
        'inset-ring-1 ring-primary bg-[color-mix(in_oklab,var(--primary)_20%,var(--card))]': selected,
      })}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <Image className="size-10" src={ffxivImageUrl(objectLibraryItem.icon)} alt={objectLibraryItem.abbr} width={80} height={80} />
      <div className="flex-1 w-0 text-sm truncate">
        {object.type === StrategyBoardObjectType.Text ? object.text : objectLibraryItem.name}
      </div>
      <div className="flex gap-1">
        <Button
          className={cn('cursor-pointer', {
            'text-muted-foreground/30 hover:text-foreground': !object.locked,
          })}
          variant="ghost"
          size="icon-sm"
          onClick={handleToggleLockedButtonClick}
        >
          {object.locked ? (
            <Lock />
          ) : (
            <Unlock />
          )}
        </Button>
        <Button
          className={cn('cursor-pointer', {
            'text-muted-foreground/30 hover:text-foreground': !object.visible,
          })}
          variant="ghost"
          size="icon-sm"
          onClick={handleToggleVisibleButtonClick}
        >
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

function SortableLayer(props: { id: string }) {
  const { id } = props

  const { isDragging, setNodeRef, transform, transition, attributes, listeners } = useSortable({ id, attributes: { tabIndex: -1 } })

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
      <Layer id={id} />
    </div>
  )
}

export function LayersPanel() {
  const {
    scene,
    selectedObjectIds,
    selectObjects,
    deleteObjects,
    isClipboardEmpty,
    cutObjects,
    copyObjects,
    pasteObjects,
    reorderObject,
    isUndoAvailable,
    undo,
    isRedoAvailable,
    redo,
  } = useStrategyBoard()

  // 右键菜单
  const handleContextMenuUndoClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    undo()
  }, [undo])
  const handleContextMenuRedoClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    redo()
  }, [redo])

  const handleContextMenuCutClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    cutObjects(selectedObjectIds)
  }, [cutObjects, selectedObjectIds])
  const handleContextMenuCopyClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    copyObjects(selectedObjectIds)
  }, [copyObjects, selectedObjectIds])
  const handleContextMenuPasteClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    pasteObjects()
  }, [pasteObjects])

  const handleContextMenuSelectAllClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    selectObjects(scene.objects.map(object => object.id))
  }, [selectObjects, scene])

  const handleContextMenuDeleteClick = useCallback<MouseEventHandler<HTMLDivElement>>(() => {
    deleteObjects(selectedObjectIds)
  }, [deleteObjects, selectedObjectIds])

  // 拖动排序
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null)

  const dndContextId = useId()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    const { active } = event
    const id = active.id as string
    setDraggingObjectId(id)
  }, [])
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
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          {scene.objects.length ? (
            <ScrollArea className="flex-1 min-h-0 pb-4">
              <div className="px-2 flex flex-col gap-0.5">
                <DndContext
                  id={dndContextId}
                  sensors={sensors}
                  modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={scene.objects} strategy={verticalListSortingStrategy}>
                    {scene.objects.map(({ id }) => (
                      <SortableLayer key={id} id={id} />
                    ))}
                    <DragOverlay className="**:cursor-grabbing">
                      {draggingObjectId && (
                        <Layer id={draggingObjectId} />
                      )}
                    </DragOverlay>
                  </SortableContext>
                </DndContext>
              </div>
            </ScrollArea>
          ) : (
            <Empty className="mb-40">
              <EmptyHeader>
                <EmptyTitle>暂无图层</EmptyTitle>
                <EmptyDescription className="text-pretty">
                  从左侧图形库拖拽图形添加到战术板
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem disabled={!isUndoAvailable} onClick={handleContextMenuUndoClick}>
              <Undo2 /> 撤销
              <ContextMenuShortcut>{isMac() ? '⌘Z' : 'Ctrl+Z'}</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled={!isRedoAvailable} onClick={handleContextMenuRedoClick}>
              <Redo2 /> 重做
              <ContextMenuShortcut>{isMac() ? '⇧⌘Z' : 'Ctrl+Y'}</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem disabled={!selectedObjectIds.length} onClick={handleContextMenuCutClick}>
              <Scissors /> 剪切
              <ContextMenuShortcut>{isMac() ? '⌘X' : 'Ctrl+X'}</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedObjectIds.length} onClick={handleContextMenuCopyClick}>
              <Copy /> 复制
              <ContextMenuShortcut>{isMac() ? '⌘C' : 'Ctrl+C'}</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled={isClipboardEmpty} onClick={handleContextMenuPasteClick}>
              <ClipboardPaste /> 粘贴
              <ContextMenuShortcut>{isMac() ? '⌘V' : 'Ctrl+V'}</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem onClick={handleContextMenuSelectAllClick}>
              <CopyCheck /> 全选
              <ContextMenuShortcut>{isMac() ? '⌘A' : 'Ctrl+A'}</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem variant="destructive" onClick={handleContextMenuDeleteClick}>
              <Trash2 /> 删除
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export function LayersPanelSkeleton() {
  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图层</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-2 flex flex-col gap-0.5">
          <div className="rounded p-2 flex items-center gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="mr-auto flex-1 max-w-30 h-4" />
            <Skeleton className="w-15 h-6" />
          </div>
          <div className="rounded p-2 flex items-center gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="mr-auto flex-1 max-w-20 h-4" />
            <Skeleton className="w-15 h-6" />
          </div>
          <div className="rounded p-2 flex items-center gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="mr-auto flex-1 max-w-40 h-4" />
            <Skeleton className="w-15 h-6" />
          </div>
          <div className="rounded p-2 flex items-center gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="mr-auto flex-1 max-w-35 h-4" />
            <Skeleton className="w-15 h-6" />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
