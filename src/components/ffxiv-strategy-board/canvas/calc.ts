
export function colorToCanvasColor(color: { r: number, g: number, b: number }): string {
  return `rgb(${color.r},${color.g},${color.b})`
}
