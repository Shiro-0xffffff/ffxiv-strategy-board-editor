'use client'

import { PointerEventHandler, useEffect, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useStrategyBoard } from '../context'
import { StrategyBoardCanvasProvider, StrategyBoardCanvas, StrategyBoardCanvasZoomButtons } from '../canvas'

import { ObjectLibraryDraggingContainer, ObjectLibraryDraggingTargetCanvas, ObjectLibraryPanel, ObjectLibraryPanelSkeleton } from './object-library'
import { PropertiesPanel, PropertiesPanelSkeleton } from './properties'
import { LayersPanel, LayersPanelSkeleton } from './layers'

function CanvasArea() {
  const { scene, selectedObjectIds, selectObjects, deleteObjects, cutObjects, copyObjects, pasteObjects, isUndoAvailable, undo, redo } = useStrategyBoard()

  useHotkeys('mod+a', () => {
    selectObjects(scene.objects.map(object => object.id))
  }, { preventDefault: true }, [selectObjects, scene])

  useHotkeys('delete', () => {
    deleteObjects(selectedObjectIds)
  }, { preventDefault: true }, [deleteObjects, selectedObjectIds])

  useHotkeys('mod+x', () => {
    cutObjects(selectedObjectIds)
  }, { preventDefault: true }, [cutObjects, selectedObjectIds])
  useHotkeys('mod+c', () => {
    copyObjects(selectedObjectIds)
  }, { preventDefault: true }, [copyObjects, selectedObjectIds])
  useHotkeys('mod+v', () => {
    pasteObjects()
  }, { preventDefault: true }, [pasteObjects])

  useHotkeys('mod+z', () => {
    undo()
  }, { preventDefault: true }, [undo])
  useHotkeys('mod+y, mod+shift+z', () => {
    redo()
  }, { preventDefault: true }, [redo])

  const handleWindowBeforeUnload = useCallback((event: BeforeUnloadEvent): void => {
    if (isUndoAvailable) event.preventDefault()
  }, [isUndoAvailable])

  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleWindowBeforeUnload)
    }
  }, [handleWindowBeforeUnload])

  const handleBackgroundPointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(() => {
    selectObjects([])
  }, [selectObjects])
  const handleCanvasContainerPointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(event => {
    event.stopPropagation()
  }, [])

  return (
    <div className="relative size-full bg-muted/30">
      <div className="size-full flex flex-col overflow-auto">
        <div className="flex-1 min-w-max flex flex-col" onPointerDown={handleBackgroundPointerDown}>
          <div className="flex-1 px-8 py-8 3xl:px-4 flex items-center justify-center">
            <div className="shadow-xl" onPointerDown={handleCanvasContainerPointerDown}>
              <ObjectLibraryDraggingTargetCanvas>
                <StrategyBoardCanvas />
              </ObjectLibraryDraggingTargetCanvas>
            </div>
          </div>
          <div className="min-w-0 min-h-0 p-4">
            <div className="text-center text-balance text-xs text-muted-foreground/15">
              <p>FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.</p>
              <p>FINAL FANTASY XI © 2002 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 m-4">
          <StrategyBoardCanvasZoomButtons />
        </div>
      </div>
    </div>
  )
}

function CanvasAreaSkeleton() {
  return (
    <div className="size-full flex flex-col bg-muted/30 overflow-auto">
      <div className="flex-1 min-w-max flex flex-col">
        <div className="flex-1 px-8 py-8 3xl:px-4 flex items-center justify-center">
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
    <StrategyBoardCanvasProvider>
      <ObjectLibraryDraggingContainer>
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="w-74 3xl:w-107 max-w-1/4 border-r flex flex-col bg-card">
            <ObjectLibraryPanel />
          </div>
          <div className="flex-1 min-w-0">
            <CanvasArea />
          </div>
          <div className="w-80 3xl:w-100 max-w-1/4 border-l flex flex-col bg-card">
            <div className="h-1/3">
              <PropertiesPanel />
            </div>
            <div className="border-b" />
            <div className="flex-1 min-h-0">
              <LayersPanel />
            </div>
          </div>
        </div>
      </ObjectLibraryDraggingContainer>
    </StrategyBoardCanvasProvider>
  )
}

export function StrategyBoardEditorSkeleton() {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      <div className="w-74 3xl:w-107 max-w-1/4 border-r flex flex-col bg-card">
        <ObjectLibraryPanelSkeleton />
      </div>
      <div className="flex-1 min-w-0">
        <CanvasAreaSkeleton />
      </div>
      <div className="w-80 3xl:w-100 max-w-1/4 border-l flex flex-col bg-card">
        <div className="h-1/3">
          <PropertiesPanelSkeleton />
        </div>
        <div className="border-b" />
        <div className="flex-1 min-h-0">
          <LayersPanelSkeleton />
        </div>
      </div>
    </div>
  )
}
