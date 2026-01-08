'use client'

import { MouseEventHandler, useState, useRef, useEffect, useCallback, useId } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PointerSensor, DragStartEvent, DragEndEvent, DndContext, DragOverlay, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react'
import { cn, ffxivImageUrl } from '@/lib/utils'
import { StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'

import { objectLibrary } from '../constants'
import { useStrategyBoard } from '../context'

function Layer(props: { id: string }) {
  const { id } = props

  const { selectedObjectIds, selectObjects, toggleObjectSelected, getObject, toggleObjectVisible, toggleObjectLocked } = useStrategyBoard()

  const object = getObject(id)!
  const objectLibraryItem = objectLibrary.get(object.type)!
  const selected = selectedObjectIds.includes(id)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected) return
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selected])

  const handlePointerDown = useCallback<MouseEventHandler<HTMLDivElement>>(event => {
    if (event.shiftKey || event.ctrlKey) {
      toggleObjectSelected(id)
    } else {
      selectObjects([id])
    }
  }, [id, selectObjects, toggleObjectSelected])

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
      className={cn('rounded p-2 flex items-center gap-2 cursor-pointer transition-colors', {
        'hover:bg-muted': !selected,
        'inset-ring-1 ring-primary bg-[color-mix(in_oklab,var(--primary)_20%,var(--card))]': selected,
      })}
      onPointerDown={handlePointerDown}
    >
      <Image className="size-10" src={ffxivImageUrl(objectLibraryItem.icon)} alt={objectLibraryItem.abbr} width={80} height={80} />
      <div className="flex-1 w-0 text-sm truncate">
        {object.type === StrategyBoardObjectType.Text ? object.text : objectLibraryItem.name}
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
  const { scene, reorderObject } = useStrategyBoard()

  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null)

  const contextId = useId()

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
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-2 flex flex-col gap-0.5">
          <DndContext
            id={contextId}
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
    </div>
  )
}
