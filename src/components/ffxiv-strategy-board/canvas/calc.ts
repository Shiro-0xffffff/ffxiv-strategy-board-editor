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

export function lengthToCanvasLength(length: number): number {
  const canvasLength = length * canvasWidth / sceneWidth
  return canvasLength
}

export function canvasLengthToLength(canvasLength: number): number {
  const length = canvasLength * sceneWidth / canvasWidth
  return length
}

export function sizeToCanvasSize(size: { width: number, height: number }): { width: number, height: number } {
  const canvasSizeWidth = size.width * canvasWidth / sceneWidth
  const canvasSizeHeight = size.height * canvasHeight / sceneHeight
  return { width: canvasSizeWidth, height: canvasSizeHeight }
}

export function canvasSizeToSize(canvasSize: { width: number, height: number }): { width: number, height: number } {
  const width = canvasSize.width * sceneWidth / canvasWidth
  const height = canvasSize.height * sceneHeight / canvasHeight
  return { width, height }
}

export function colorToCanvasColor(color: { r: number, g: number, b: number }): string {
  return `rgb(${color.r},${color.g},${color.b})`
}
