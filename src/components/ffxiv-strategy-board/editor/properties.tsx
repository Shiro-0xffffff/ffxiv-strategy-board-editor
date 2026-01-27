'use client'

import { ReactNode, MouseEventHandler, ChangeEventHandler, FocusEventHandler, useState, useEffect, useEffectEvent, useCallback, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { FieldGroup, FieldSet, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2 } from 'lucide-react'
import { StrategyBoardBackground, StrategyBoardObject, StrategyBoardObjectType, sceneWidth, sceneHeight, truncateString } from '@/lib/ffxiv-strategy-board'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'

import { ColorPicker } from './color-picker'

function InputField(props: { name: string, description?: string, maxBytes?: number, value: string | null, onChange?: (value: string) => void, onCommit?: (value: string) => void }) {
  const { name, description, maxBytes = Infinity, value, onChange, onCommit } = props

  const [draft, setDraft] = useState<string | null>(null)

  const id = useId()

  const commitValueBeforeUnmount = useEffectEvent(() => {
    if (draft === null) return
    setDraft(null)
    const value = truncateString(draft, maxBytes)
    onCommit?.(value)
  })
  useEffect(() => () => commitValueBeforeUnmount(), [])

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const draft = event.target.value
    setDraft(draft)
    const value = truncateString(draft, maxBytes)
    onChange?.(value)
  }, [maxBytes, onChange])
  const handleInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (draft === null) return
    setDraft(null)
    const value = truncateString(draft, maxBytes)
    onCommit?.(value)
  }, [draft, maxBytes, onCommit])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      {!!description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <Input
        id={id}
        value={draft ?? value ?? ''}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
      />
    </Field>
  )
}

function NumberInputField(props: { name: string, description?: string, min?: number, max?: number, step?: number, roundTo?: number, value: number | null, onChange?: (value: number) => void, onCommit?: (value: number) => void }) {
  const { name, description, min = -Infinity, max = Infinity, step = 1, roundTo = 1, value, onChange, onCommit } = props

  const [draft, setDraft] = useState<string | null>(null)

  const id = useId()

  const commitValueBeforeUnmount = useEffectEvent(() => {
    if (draft === null) return
    setDraft(null)
    const value = Math.round(Math.min(Math.max(Number(draft), min), max) / roundTo) * roundTo
    if (Number.isInteger(value)) onCommit?.(value)
  })
  useEffect(() => () => commitValueBeforeUnmount(), [])

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const draft = event.target.value
    setDraft(draft)
    const value = Math.round(Math.min(Math.max(Number(draft), min), max) / roundTo) * roundTo
    if (Number.isInteger(value)) onChange?.(value)
  }, [min, max, roundTo, onChange])
  const handleInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (draft === null) return
    setDraft(null)
    const value = Math.round(Math.min(Math.max(Number(draft), min), max) / roundTo) * roundTo
    if (Number.isInteger(value)) onCommit?.(value)
  }, [draft, min, max, roundTo, onCommit])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      {!!description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft ?? value ?? ''}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
      />
    </Field>
  )
}

function SliderField(props: { name: string, description?: string, min?: number, max?: number, step?: number, roundTo?: number, value: number | null, onChange?: (value: number) => void, onCommit?: (value: number) => void }) {
  const { name, description, min = -Infinity, max = Infinity, step = 1, roundTo = 1, value, onChange, onCommit } = props

  const [inputDraft, setInputDraft] = useState<string | null>(null)

  const id = useId()

  const commitValueBeforeUnmount = useEffectEvent(() => {
    if (inputDraft === null) return
    setInputDraft(null)
    const value = Math.round(Math.min(Math.max(Number(inputDraft), min), max) / roundTo) * roundTo
    if (Number.isInteger(value)) onCommit?.(value)
  })
  useEffect(() => () => commitValueBeforeUnmount(), [])

  const handleSliderValueChange = useCallback(([value]: number[]): void => {
    onChange?.(value)
  }, [onChange])
  const handleSliderValueCommit = useCallback(([value]: number[]): void => {
    onCommit?.(value)
  }, [onCommit])

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const draft = event.target.value
    setInputDraft(draft)
    const value = Math.round(Math.min(Math.max(Number(draft), min), max) / roundTo) * roundTo
    if (Number.isInteger(value)) onChange?.(value)
  }, [min, max, roundTo, onChange])
  const handleInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (inputDraft === null) return
    setInputDraft(null)
    const value = Math.round(Math.min(Math.max(Number(inputDraft), min), max) / roundTo) * roundTo
    if (Number.isInteger(value)) onCommit?.(value)
  }, [inputDraft, min, max, roundTo, onCommit])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      {!!description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <div className="flex flex-col md:flex-row gap-2">
        <Slider
          className="min-h-6"
          min={min}
          max={max}
          step={step}
          value={value === null ? [] : [value]}
          onValueChange={handleSliderValueChange}
          onValueCommit={handleSliderValueCommit}
        />
        <InputGroup className="md:w-30">
          <InputGroupInput
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputDraft ?? value ?? ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <InputGroupAddon align="inline-end">%</InputGroupAddon>
        </InputGroup>
      </div>
    </Field>
  )
}

function SelectField<T>(props: { name: string, description?: string, options: { value: T, name: string }[], value: T | null, onChange?: (value: T) => void, onCommit?: (value: T) => void }) {
  const { name, description, options, value, onCommit } = props

  const id = useId()

  const handleSelectValueChange = useCallback((valueJson: string): void => {
    const value: T = JSON.parse(valueJson)
    onCommit?.(value)
  }, [onCommit])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      {!!description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <div className="*:w-full">
        <Select value={JSON.stringify(value)} onValueChange={handleSelectValueChange}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{name}</SelectLabel>
              {options.map(({ value, name }) => (
                <SelectItem key={JSON.stringify(value)} value={JSON.stringify(value)}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </Field>
  )
}

function ColorSelectField(props: { name: string, description?: string, value: string | null, onChange?: (value: string) => void, onCommit?: (value: string) => void }) {
  const { name, description, value, onChange, onCommit } = props

  const id = useId()

  const handleColorPickerChange = useCallback((value: string): void => {
    onChange?.(value)
  }, [onChange])
  const handleColorPickerCommit = useCallback((value: string): void => {
    onCommit?.(value)
  }, [onCommit])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      {!!description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <ColorPicker
        id={id}
        value={value}
        onChange={handleColorPickerChange}
        onCommit={handleColorPickerCommit}
      />
    </Field>
  )
}

function ScenePropertiesPanel() {
  const { scene, setBackground } = useStrategyBoard()

  const handleSceneBackgroundFieldChange = useCallback((background: StrategyBoardBackground): void => {
    setBackground(background)
  }, [setBackground])

  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">战术板属性</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4 pb-4">
          <FieldGroup>
            <FieldSet>
              <SelectField
                name="背景"
                description="背景不可旋转缩放移动，如需调整可从左侧图形库另外添加场地"
                options={[...backgroundOptions.entries()].map(([background, { name }]) => ({ value: background, name }))}
                value={scene.background}
                onChange={handleSceneBackgroundFieldChange}
              />
            </FieldSet>
          </FieldGroup>
        </div>
      </ScrollArea>
    </div>
  )
}

interface ObjectPropertyFieldProps<T, O extends StrategyBoardObject> {
  availableFor?: (object: StrategyBoardObject) => object is O
  getValueFromObject: (object: O) => T
  updateObjectWithValue: (object: O, value: T) => void
  renderField: (props: { value: T | null, onChange: (value: T) => void, onCommit: (value: T) => void }) => ReactNode
}

function ObjectPropertyField<T, O extends StrategyBoardObject>(props: ObjectPropertyFieldProps<T, O>) {
  const { availableFor = (object: StrategyBoardObject): object is O => true, getValueFromObject, updateObjectWithValue, renderField } = props

  const { scene, selectedObjectIds, modifyObjects } = useStrategyBoard()

  const selectedObjects = selectedObjectIds.map(id => scene.objects.find(object => object.id === id)).filter(object => !!object)
  const objectsForField = selectedObjects.filter(availableFor)

  if (objectsForField.length !== selectedObjects.length) return null

  const value = getValueFromObject(objectsForField[0])

  return renderField({
    value: objectsForField.every(object => getValueFromObject(object) === value) ? value : null,
    onChange: value => modifyObjects(objectsForField.map(object => ({
      id: object.id,
      modification: object => {
        if (availableFor(object)) updateObjectWithValue(object, value)
      },
    })), true),
    onCommit: value => modifyObjects(objectsForField.map(object => ({
      id: object.id,
      modification: object => {
        if (availableFor(object)) updateObjectWithValue(object, value)
      },
    }))),
  })
}

interface ObjectPropertyFieldGroupProps<O extends StrategyBoardObject> {
  availableFor?: (object: StrategyBoardObject) => object is O
  children: ReactNode
}

function ObjectPropertyFieldGroup<O extends StrategyBoardObject>(props: ObjectPropertyFieldGroupProps<O>) {
  const { availableFor = (object: StrategyBoardObject): object is O => true, children } = props

  const { scene, selectedObjectIds } = useStrategyBoard()

  const selectedObjects = selectedObjectIds.map(id => scene.objects.find(object => object.id === id)).filter(object => !!object)

  return selectedObjects.every(availableFor) ? children : null
}

function ObjectPropertiesPanel() {
  const { selectedObjectIds, deleteObjects } = useStrategyBoard()

  const handleDeleteButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    deleteObjects(selectedObjectIds)
  }, [deleteObjects, selectedObjectIds])

  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">图形属性</div>
        <div className="-my-1 flex gap-1">
          <Button className="cursor-pointer" variant="ghost" size="icon" onClick={handleDeleteButtonClick}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-2">
        <div className="px-4 pb-4">
          <FieldGroup>
            <FieldSet>
              <div className="grid md:grid-cols-2 gap-4">
                <ObjectPropertyField
                  getValueFromObject={object => object.position.x}
                  updateObjectWithValue={(object, value) => { object.position.x = value }}
                  renderField={props => (
                    <NumberInputField
                      name="X"
                      min={-sceneWidth / 2}
                      max={sceneWidth / 2}
                      step={10}
                      {...props}
                    />
                  )}
                />
                <ObjectPropertyField
                  getValueFromObject={object => object.position.y}
                  updateObjectWithValue={(object, value) => { object.position.y = value }}
                  renderField={props => (
                    <NumberInputField
                      name="Y"
                      min={-sceneHeight / 2}
                      max={sceneHeight / 2}
                      step={10}
                      {...props}
                    />
                  )}
                />
              </div>
              <ObjectPropertyField
                availableFor={object => (
                  object.type !== StrategyBoardObjectType.Text &&
                  object.type !== StrategyBoardObjectType.Line &&
                  object.type !== StrategyBoardObjectType.MechanicCircleAoE
                )}
                getValueFromObject={object => object.rotation}
                updateObjectWithValue={(object, value) => { object.rotation = value }}
                renderField={props => (
                  <NumberInputField
                    name="角度"
                    min={-180}
                    max={180}
                    step={15}
                    {...props}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => (
                  object.type !== StrategyBoardObjectType.Text &&
                  object.type !== StrategyBoardObjectType.Line &&
                  object.type !== StrategyBoardObjectType.Rectangle
                )}
                getValueFromObject={object => object.size}
                updateObjectWithValue={(object, value) => { object.size = value }}
                renderField={props => (
                  <NumberInputField
                    name="尺寸"
                    min={0}
                    max={255}
                    step={10}
                    {...props}
                  />
                )}
              />
              <ObjectPropertyFieldGroup availableFor={object => object.type === StrategyBoardObjectType.Rectangle}>
                <div className="grid md:grid-cols-2 gap-4">
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Rectangle}
                    getValueFromObject={object => object.size.width}
                    updateObjectWithValue={(object, value) => { object.size.width = value }}
                    renderField={props => (
                      <NumberInputField
                        name="宽度"
                        min={0}
                        max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                        step={10}
                        roundTo={10}
                        {...props}
                      />
                    )}
                  />
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Rectangle}
                    getValueFromObject={object => object.size.height}
                    updateObjectWithValue={(object, value) => { object.size.height = value }}
                    renderField={props => (
                      <NumberInputField
                        name="高度"
                        min={0}
                        max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                        step={10}
                        roundTo={10}
                        {...props}
                      />
                    )}
                  />
                </div>
              </ObjectPropertyFieldGroup>
              <ObjectPropertyFieldGroup availableFor={object => object.type === StrategyBoardObjectType.Line}>
                <div className="grid md:grid-cols-2 gap-4">
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Line}
                    getValueFromObject={object => object.endPointOffset.x}
                    updateObjectWithValue={(object, value) => { object.endPointOffset.x = value }}
                    renderField={props => (
                      <NumberInputField
                        name="端点 X"
                        min={-sceneWidth}
                        max={sceneWidth}
                        step={10}
                        {...props}
                      />
                    )}
                  />
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Line}
                    getValueFromObject={object => object.endPointOffset.y}
                    updateObjectWithValue={(object, value) => { object.endPointOffset.y = value }}
                    renderField={props => (
                      <NumberInputField
                        name="端点 Y"
                        min={-sceneHeight}
                        max={sceneHeight}
                        step={10}
                        {...props}
                      />
                    )}
                  />
                </div>
                <ObjectPropertyField
                  availableFor={object => object.type === StrategyBoardObjectType.Line}
                  getValueFromObject={object => object.lineWidth}
                  updateObjectWithValue={(object, value) => { object.lineWidth = value }}
                  renderField={props => (
                    <NumberInputField
                      name="线条宽度"
                      min={0}
                      max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                      step={10}
                      {...props}
                    />
                  )}
                />
              </ObjectPropertyFieldGroup>
              <ObjectPropertyField
                availableFor={object => object.type === StrategyBoardObjectType.MechanicDonutAoE}
                getValueFromObject={object => object.innerRadius}
                updateObjectWithValue={(object, value) => { object.innerRadius = value }}
                renderField={props => (
                  <NumberInputField
                    name="环形范围"
                    min={0}
                    max={255}
                    step={10}
                    {...props}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => (
                  object.type === StrategyBoardObjectType.MechanicConeAoE ||
                  object.type === StrategyBoardObjectType.MechanicDonutAoE
                )}
                getValueFromObject={object => object.arcAngle}
                updateObjectWithValue={(object, value) => { object.arcAngle = value }}
                renderField={props => (
                  <NumberInputField
                    name="范围角度"
                    min={0}
                    max={360}
                    step={10}
                    {...props}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => object.type === StrategyBoardObjectType.MechanicLineStack}
                getValueFromObject={object => object.displayCount}
                updateObjectWithValue={(object, value) => { object.displayCount = value }}
                renderField={props => (
                  <NumberInputField
                    name="显示数量"
                    min={1}
                    max={63}
                    step={1}
                    {...props}
                  />
                )}
              />
              <ObjectPropertyFieldGroup availableFor={object => object.type === StrategyBoardObjectType.MechanicLinearKnockback}>
                <div className="grid md:grid-cols-2 gap-4">
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.MechanicLinearKnockback}
                    getValueFromObject={object => object.displayCount.horizontal}
                    updateObjectWithValue={(object, value) => { object.displayCount.horizontal = value }}
                    renderField={props => (
                      <NumberInputField
                        name="横向数量"
                        min={1}
                        max={63}
                        step={1}
                        {...props}
                      />
                    )}
                  />
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.MechanicLinearKnockback}
                    getValueFromObject={object => object.displayCount.vertical}
                    updateObjectWithValue={(object, value) => { object.displayCount.vertical = value }}
                    renderField={props => (
                      <NumberInputField
                        name="纵向数量"
                        min={1}
                        max={63}
                        step={1}
                        {...props}
                      />
                    )}
                  />
                </div>
              </ObjectPropertyFieldGroup>
              <ObjectPropertyField
                availableFor={object => object.type === StrategyBoardObjectType.Text}
                getValueFromObject={object => object.text}
                updateObjectWithValue={(object, value) => { object.text = value }}
                renderField={props => (
                  <InputField
                    name="文本"
                    description="最多30字符，汉字及全角符号算作3字符"
                    maxBytes={30}
                    {...props}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => (
                  object.type === StrategyBoardObjectType.Text ||
                  object.type === StrategyBoardObjectType.Line ||
                  object.type === StrategyBoardObjectType.Rectangle
                )}
                getValueFromObject={object => object.color}
                updateObjectWithValue={(object, value) => { object.color = value }}
                renderField={props => (
                  <ColorSelectField
                    name="颜色"
                    {...props}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => object.type !== StrategyBoardObjectType.Text}
                getValueFromObject={object => object.transparency}
                updateObjectWithValue={(object, value) => { object.transparency = value }}
                renderField={props => (
                  <SliderField
                    name="透明度"
                    min={0}
                    max={100}
                    step={10}
                    {...props}
                  />
                )}
              />
            </FieldSet>
          </FieldGroup>
        </div>
      </ScrollArea>
    </div>
  )
}

export function PropertiesPanel() {
  const { selectedObjectIds } = useStrategyBoard()

  return selectedObjectIds.length ? (
    <ObjectPropertiesPanel />
  ) : (
    <ScenePropertiesPanel />
  )
}

export function PropertiesPanelSkeleton() {
  return (
    <div className="size-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">战术板属性</div>
      </div>
      <ScrollArea className="flex-1 min-h-0 pb-4">
        <div className="px-4 pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="my-0.5 w-12 h-4" />
              <Skeleton className="w-full h-8" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="my-0.5 w-20 h-4" />
              <Skeleton className="w-full h-8" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
