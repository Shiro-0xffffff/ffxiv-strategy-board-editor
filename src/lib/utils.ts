import { createTranslator } from 'short-uuid'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const uuidTranslator = createTranslator()

export function encodeUUID(uuid: string): string {
  const encodedUUID = uuidTranslator.fromUUID(uuid)
  return encodedUUID
}

export function decodeUUID(encodedUUID: string): string {
  const uuid = uuidTranslator.toUUID(encodedUUID)
  return uuid
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function isMac(): boolean {
  return !!navigator.userAgent.match(/mac/i)
}

export function ffxivImageUrl(imageId: string): string {
  if (!imageId.match(/^[0-9]{6}$/)) return ffxivImageUrl('000000')
  return `https://v2.xivapi.com/api/asset?path=ui/icon/${imageId.slice(0, 3)}000/${imageId}_hr1.tex&format=png`
}
