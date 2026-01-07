import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function ffxivImageUrl(imageId: string): string {
  if (!imageId.match(/^[0-9]{6}$/)) return ffxivImageUrl('000000')
  return `https://v2.xivapi.com/api/asset?path=ui/icon/${imageId.slice(0, 3)}000/${imageId}_hr1.tex&format=png`
}
