'use client'

import { ComponentProps, CSSProperties, PointerEventHandler, ChangeEventHandler, FocusEventHandler, useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import Color from 'color'
import { cn } from '@/lib/utils'

const colorSwatches = [
  ['#ffffff', '#ffbdbf', '#ffe0c8', '#fff8b0', '#e9ffe2', '#e8fffe', '#9cd0f4', '#ffdcff'],
  ['#f8f8f8', '#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
  ['#e0e0e0', '#ff4c4c', '#ffa666', '#ffffb2', '#80ff00', '#bcfff0', '#0080ff', '#e26090'],
  ['#d8d8d8', '#ff7f7f', '#ffceac', '#ffde73', '#80f860', '#66e6ff', '#94c0ff', '#ff8cc6'],
  ['#cccccc', '#ffc0c0', '#ff6800', '#f0c86c', '#d4ff7f', '#acdce6', '#8080ff', '#ffb8e0'],
  ['#bfbfbf', '#d8c0c0', '#d8686c', '#cccc66', '#acd848', '#b0e8e8', '#b38cff', '#e0a8bc'],
  ['#a6a6a6', '#c6a2a2', '#d8beac', '#c8c0a0', '#3ae8b4', '#3ce8e8', '#e0c0f8', '#e088f4'],
]

interface ColorPickerProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value: string | null
  onChange?: (color: string) => void
}

export function ColorPicker(props: ColorPickerProps) {
  const { className, value, onChange, onFocus, onBlur, ...restProps } = props

  const rgbColor = Color(value ?? '#ffffff')

  const [inputDraft, setInputDraft] = useState<string | null>(null)
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [hsvDraft, setHSVDraft] = useState<{ h: number, s: number, v: number } | null>(null)
  const [isDraggingColorFieldMarker, setIsDraggingColorFieldMarker] = useState<boolean>(false)

  const inputGroupRef = useRef<HTMLDivElement>(null)
  const colorFieldRef = useRef<HTMLDivElement>(null)

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const draft = event.target.value
    setInputDraft(draft)
    try {
      const value = Color(draft).rgb().hex().toLowerCase()
      setHSVDraft(Color(draft).hsv().object() as { h: number, s: number, v: number })
      onChange?.(value)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {}
  }, [onChange])
  const handleInputFocus = useCallback<FocusEventHandler<HTMLInputElement>>(event => {
    setPopoverOpen(true)
    onFocus?.(event)
  }, [onFocus])
  const handleInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(event => {
    setInputDraft(null)
    onBlur?.(event)
  }, [onBlur])

  const handlePopoverOpenChange = useCallback((open: boolean): void => {
    setPopoverOpen(open)
    if (!open) {
      setHSVDraft(null)
    }
  }, [])
  const handlePopoverInteractOutside = useCallback((event: CustomEvent): void => {
    if (inputGroupRef.current?.contains(event.target as Node)) event.preventDefault()
  }, [])

  const getSVFromPointerPosition = useCallback((event: PointerEvent): { s: number, v: number } => {
    if (!colorFieldRef.current) return { s: 0, v: 0 }
    const colorFieldRect = colorFieldRef.current.getBoundingClientRect()
    const x = Math.min(Math.max((event.clientX - colorFieldRect.left) / colorFieldRect.width, 0), 1)
    const y = Math.min(Math.max((event.clientY - colorFieldRect.top) / colorFieldRect.height, 0), 1)
    const s = x * 100
    const v = 100 - y * 100
    return { s, v }
  }, [])

  const handleColorFieldPointerDown = useCallback<PointerEventHandler>(event => {
    setIsDraggingColorFieldMarker(true)
    const { s, v } = getSVFromPointerPosition(event.nativeEvent)
    const updatedHSVDraft = { ...hsvDraft ?? rgbColor.hsv().object() as { h: number, s: number, v: number }, s, v }
    setHSVDraft(updatedHSVDraft)
  }, [rgbColor, hsvDraft, getSVFromPointerPosition])

  const handleWindowPointerMove = useCallback((event: PointerEvent): void => {
    if (!isDraggingColorFieldMarker) return
    const { s, v } = getSVFromPointerPosition(event)
    const updatedHSVDraft = { ...hsvDraft ?? rgbColor.hsv().object() as { h: number, s: number, v: number }, s, v }
    setHSVDraft(updatedHSVDraft)
  }, [rgbColor, hsvDraft, isDraggingColorFieldMarker, getSVFromPointerPosition])
  const handleWindowPointerUp = useCallback((event: PointerEvent): void => {
    if (!isDraggingColorFieldMarker) return
    setIsDraggingColorFieldMarker(false)
    const { s, v } = getSVFromPointerPosition(event)
    const updatedHSVDraft = { ...hsvDraft ?? rgbColor.hsv().object() as { h: number, s: number, v: number }, s, v }
    onChange?.(Color(updatedHSVDraft).rgb().hex().toLowerCase())
  }, [rgbColor, hsvDraft, isDraggingColorFieldMarker, getSVFromPointerPosition, onChange])

  useEffect(() => {
    if (isDraggingColorFieldMarker) {
      window.addEventListener('pointermove', handleWindowPointerMove)
      window.addEventListener('pointerup', handleWindowPointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }
  }, [isDraggingColorFieldMarker, handleWindowPointerMove, handleWindowPointerUp])

  const handleHueSliderValueChange = useCallback(([value]: number[]): void => {
    const updatedHSVDraft = { ...hsvDraft ?? rgbColor.hsv().object() as { h: number, s: number, v: number }, h: value }
    setHSVDraft(updatedHSVDraft)
  }, [rgbColor, hsvDraft])
  const handleHueSliderValueCommit = useCallback(([value]: number[]): void => {
    const updatedHSVDraft = { ...hsvDraft ?? rgbColor.hsv().object() as { h: number, s: number, v: number }, h: value }
    onChange?.(Color(updatedHSVDraft).rgb().hex().toLowerCase())
  }, [rgbColor, hsvDraft, onChange])

  const handleColorPaletteColorSelect = useCallback((color: string): void => {
    setHSVDraft(Color(color).hsv().object() as { h: number, s: number, v: number })
    onChange?.(Color(color).rgb().hex().toLowerCase())
  }, [onChange])

  return (
    <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverAnchor asChild>
        <InputGroup ref={inputGroupRef}>
          <InputGroupAddon>
            <div className="-ml-0.5 size-5 border rounded-sm cursor-default" style={{ backgroundColor: rgbColor.hex() }} />
          </InputGroupAddon>
          <InputGroupInput
            className={cn('font-mono', className)}
            value={inputDraft ?? value?.toUpperCase() ?? ''}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            {...restProps}
          />
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent
        className="w-64"
        sideOffset={6}
        align="start"
        onOpenAutoFocus={event => event.preventDefault()}
        onEscapeKeyDown={event => event.preventDefault()}
        onInteractOutside={handlePopoverInteractOutside}
      >
        <div
          ref={colorFieldRef}
          className="relative w-full h-32 rounded bg-[linear-gradient(to_bottom,transparent,black),linear-gradient(to_right,white,hsl(var(--hue),100%,50%))] cursor-crosshair select-none"
          style={{ '--hue': hsvDraft?.h ?? rgbColor.hue() } as CSSProperties}
          onPointerDown={handleColorFieldPointerDown}
        >
          <div
            className="absolute left-(--saturation) bottom-(--value) -m-1.5 size-3 border-2 border-white rounded-full ring-1 ring-black/30 inset-ring-1 inset-ring-black/30 pointer-events-none"
            style={{
              '--saturation': `${hsvDraft?.s ?? rgbColor.saturationv()}%`,
              '--value': `${hsvDraft?.v ?? rgbColor.value()}%`,
            } as CSSProperties}
          />
        </div>
        <Slider
          className="**:data-[slot=slider-track]:h-2 **:data-[slot=slider-track]:bg-[linear-gradient(to_right_in_hsl_longer_hue,red,red)] **:data-[slot=slider-range]:bg-transparent"
          min={0}
          max={360}
          value={[hsvDraft?.h ?? rgbColor.hue()]}
          onValueChange={handleHueSliderValueChange}
          onValueCommit={handleHueSliderValueCommit}
        />
        <div className="flex flex-col gap-1.5">
          {colorSwatches.map((row, index) => (
            <div key={index} className="flex justify-between gap-1.5">
              {row.map(swatchColor => (
                <button
                  key={swatchColor}
                  className={cn('size-6 border rounded-sm bg-(--color) hover:scale-110 transition-all', {
                    'border-foreground ring-2 ring-ring ring-offset-1 ring-offset-background': swatchColor === value,
                  })}
                  style={{ '--color': swatchColor } as CSSProperties}
                  onClick={() => handleColorPaletteColorSelect(swatchColor)}
                />
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
