'use client'

import { ReactNode, useState, useCallback, useId } from 'react'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { MouseSensor, TouchSensor, DragStartEvent, DragEndEvent, DndContext, DragOverlay, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { ffxivImageUrl } from '@/lib/utils'
import { StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'

import { objectLibrary, objectLibraryGroups } from '../constants'
import { StrategyBoardCanvasObjectPreview } from '../canvas'

function ObjectIcon(props: { objectType: StrategyBoardObjectType }) {
  const { objectType } = props

  const objectLibraryItem = objectLibrary.get(objectType)!

  return (
    <Tooltip delayDuration={700}>
      <TooltipTrigger asChild>
        <div className="size-10 rounded-sm select-none">
          <Image className="size-10" src={ffxivImageUrl(objectLibraryItem.icon)} alt={objectLibraryItem.abbr} width={80} height={80} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{objectLibraryItem.name}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function DraggableObjectIcon(props: { objectType: StrategyBoardObjectType }) {
  const { objectType } = props

  const { setNodeRef, attributes, listeners } = useDraggable({ id: objectType, attributes: { tabIndex: -1 } })

  return (
    <div ref={setNodeRef} className="cursor-grab" {...attributes} {...listeners}>
      <ObjectIcon objectType={objectType} />
    </div>
  )
}

function ObjectPreview(props: { objectType: StrategyBoardObjectType }) {
  const { objectType } = props

  return (
    <div className="size-10 flex items-center justify-center">
      <StrategyBoardCanvasObjectPreview objectType={objectType} />
    </div>
  )
}

interface DraggingTargetData {
  onObjectDraggedIn?: (type: StrategyBoardObjectType, canvasPosition: { x: number, y: number }) => void
}

export function ObjectLibraryDraggingContainer(props: { children?: ReactNode }) {
  const { children } = props

  const [draggingObjectType, setDraggingObjectType] = useState<StrategyBoardObjectType | null>(null)

  const contextId = useId()

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
  )

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    const { active } = event
    const objectType = active.id as StrategyBoardObjectType
    setDraggingObjectType(objectType)
  }, [])
  const handleDragEnd = useCallback((event: DragEndEvent): void => {
    const { active, over } = event
    setDraggingObjectType(null)
    if (!draggingObjectType || !active.rect.current.translated || !over || !over.data.current) return
    const position = {
      x: (active.rect.current.translated.left + active.rect.current.translated.right) / 2 - (over.rect.left + over.rect.right) / 2,
      y: (active.rect.current.translated.top + active.rect.current.translated.bottom) / 2 - (over.rect.top + over.rect.bottom) / 2,
    }
    const { onObjectDraggedIn }: DraggingTargetData = over.data.current
    onObjectDraggedIn?.(draggingObjectType, position)
  }, [draggingObjectType])

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      autoScroll={false}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay className="**:cursor-grabbing" dropAnimation={null}>
        {draggingObjectType && (
          <ObjectPreview objectType={draggingObjectType} />
        )}
      </DragOverlay>
    </DndContext>
  )
}

export function ObjectLibraryDraggingTarget(props: { onObjectDraggedIn?: (type: StrategyBoardObjectType, position: { x: number, y: number }) => void, children?: ReactNode }) {
  const { onObjectDraggedIn, children } = props

  const { setNodeRef } = useDroppable({ id: 'canvas', data: { onObjectDraggedIn } as DraggingTargetData })

  return (
    <div ref={setNodeRef} className="size-full">
      {children}
    </div>
  )
}

export function ObjectLibraryPanel() {
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
                {group.objectTypes.map((row, index) => (
                  <div key={index} className="flex flex-wrap gap-1">
                    {row.map((segments, index) => (
                      <div key={index} className="flex flex-wrap gap-1">
                        {segments.map((objectType, index) => (
                          <DraggableObjectIcon key={index} objectType={objectType} />
                        ))}
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

export function ObjectLibraryPanelSkeleton() {
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
                {group.objectTypes.map((row, index) => (
                  <div key={index} className="flex flex-wrap gap-1">
                    {row.map((segments, index) => (
                      <div key={index} className="flex flex-wrap gap-1">
                        {segments.map((objectType, index) => (
                          <ObjectIcon key={index} objectType={objectType} />
                        ))}
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
