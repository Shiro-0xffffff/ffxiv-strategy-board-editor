import { sceneWidth, sceneHeight } from '@/lib/ffxiv-strategy-board'

export const canvasWidth = 1024
export const canvasHeight = 768

export function positionToCanvasPosition(position: { x: number, y: number }): { x: number, y: number } {
  const x = position.x * canvasWidth / sceneWidth
  const y = position.y * canvasHeight / sceneHeight
  return { x, y }
}

export function canvasPositionToPosition(canvasPosition: { x: number, y: number }): { x: number, y: number } {
  const x = canvasPosition.x * sceneWidth / canvasWidth
  const y = canvasPosition.y * sceneHeight / canvasHeight
  return { x, y }
}
