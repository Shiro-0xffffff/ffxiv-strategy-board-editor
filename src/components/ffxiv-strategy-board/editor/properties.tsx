'use client'

import { ReactNode, MouseEventHandler, ChangeEventHandler, FocusEventHandler, useState, useCallback, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select'
import { FieldGroup, FieldSet, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2 } from 'lucide-react'
import { StrategyBoardBackground, StrategyBoardObject, StrategyBoardObjectType, sceneWidth, sceneHeight, truncateString } from '@/lib/ffxiv-strategy-board'

import { backgroundOptions } from '../constants'
import { useStrategyBoard } from '../context'

function InputField(props: { name: string, description?: string, maxBytes?: number, value: string | null, onChange?: (value: string) => void }) {
  const { name, description, maxBytes = Infinity, value, onChange } = props

  const [draft, setDraft] = useState<string | null>(null)

  const id = useId()

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const draft = event.target.value
    setDraft(draft)
    const value = truncateString(draft, maxBytes)
    onChange?.(value)
  }, [onChange, maxBytes])
  const handleInputFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    const draft = String(value ?? '')
    setDraft(draft)
  }, [value])
  const handleInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setDraft(null)
  }, [])

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
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </Field>
  )
}

function NumberInputField(props: { name: string, description?: string, min?: number, max?: number, step?: number, value: number | null, onChange?: (value: number) => void }) {
  const { name, description, min = -Infinity, max = Infinity, step, value, onChange } = props

  const [draft, setDraft] = useState<string | null>(null)

  const id = useId()

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const draft = event.target.value
    setDraft(draft)
    const value = Math.round(Math.min(Math.max(Number(draft), min), max))
    if (Number.isInteger(value)) onChange?.(value)
  }, [onChange, min, max])
  const handleInputFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    const draft = String(value ?? '')
    setDraft(draft)
  }, [value])
  const handleInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setDraft(null)
  }, [])

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
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </Field>
  )
}

function SelectField<T>(props: { name: string, description?: string, options: { value: T, name: string }[], value: T | null, onChange?: (value: T) => void }) {
  const { name, description, options, value, onChange } = props

  const id = useId()

  const handleSelectValueChange = useCallback((valueJson: string): void => {
    const value: T = JSON.parse(valueJson)
    onChange?.(value)
  }, [onChange])

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

function ColorSelectField(props: { name: string, description?: string, value: { r: number, g: number, b: number } | null, onChange?: (value: { r: number, g: number, b: number }) => void }) {
  const { name, description, value, onChange } = props

  const id = useId()

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    const value: { r: number, g: number, b: number } = JSON.parse(event.target.value)
    onChange?.(value)
  }, [onChange])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      {!!description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <Input
        id={id}
        value={JSON.stringify(value)}
        onChange={handleInputChange}
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
  renderField: (props: { value: T | null, onChange: (value: T) => void }) => ReactNode
}

function ObjectPropertyField<T, O extends StrategyBoardObject>(props: ObjectPropertyFieldProps<T, O>) {
  const { availableFor = (object: StrategyBoardObject): object is O => true, getValueFromObject, updateObjectWithValue, renderField } = props

  const { scene, selectedObjectIds, setObjectsProperties } = useStrategyBoard()
  
  const selectedObjects = selectedObjectIds.map(id => scene.objects.find(object => object.id === id)).filter(object => !!object)
  const objectsForField = selectedObjects.filter(availableFor)

  if (objectsForField.length !== selectedObjects.length) return null

  const value = getValueFromObject(objectsForField[0])

  return renderField({
    value: objectsForField.every(object => getValueFromObject(object) === value) ? value : null,
    onChange: value => setObjectsProperties(objectsForField.map(object => ({
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
              <div className="grid grid-cols-2 gap-4">
                <ObjectPropertyField
                  getValueFromObject={object => object.position.x}
                  updateObjectWithValue={(object, value) => { object.position.x = value }}
                  renderField={({ value, onChange }) => (
                    <NumberInputField
                      name="X"
                      min={-sceneWidth / 2}
                      max={sceneWidth / 2}
                      step={10}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <ObjectPropertyField
                  getValueFromObject={object => object.position.y}
                  updateObjectWithValue={(object, value) => { object.position.y = value }}
                  renderField={({ value, onChange }) => (
                    <NumberInputField
                      name="Y"
                      min={-sceneHeight / 2}
                      max={sceneHeight / 2}
                      step={10}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
              <ObjectPropertyField
                availableFor={object => object.type !== StrategyBoardObjectType.Text}
                getValueFromObject={object => object.rotation}
                updateObjectWithValue={(object, value) => { object.rotation = value }}
                renderField={({ value, onChange }) => (
                  <NumberInputField
                    name="角度"
                    min={-180}
                    max={180}
                    step={10}
                    value={value}
                    onChange={onChange}
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
                renderField={({ value, onChange }) => (
                  <NumberInputField
                    name="尺寸"
                    min={0}
                    max={255}
                    step={10}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <ObjectPropertyFieldGroup availableFor={object => object.type === StrategyBoardObjectType.Rectangle}>
                <div className="grid grid-cols-2 gap-4">
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Rectangle}
                    getValueFromObject={object => object.size.width}
                    updateObjectWithValue={(object, value) => { object.size.width = value }}
                    renderField={({ value, onChange }) => (
                      <NumberInputField
                        name="宽度"
                        min={0}
                        max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                        step={10}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Rectangle}
                    getValueFromObject={object => object.size.height}
                    updateObjectWithValue={(object, value) => { object.size.height = value }}
                    renderField={({ value, onChange }) => (
                      <NumberInputField
                        name="高度"
                        min={0}
                        max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                        step={10}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </ObjectPropertyFieldGroup>
              <ObjectPropertyFieldGroup availableFor={object => object.type === StrategyBoardObjectType.Line}>
                <div className="grid grid-cols-2 gap-4">
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Line}
                    getValueFromObject={object => object.length}
                    updateObjectWithValue={(object, value) => { object.length = value }}
                    renderField={({ value, onChange }) => (
                      <NumberInputField
                        name="长度"
                        min={0}
                        max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                        step={10}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.Line}
                    getValueFromObject={object => object.lineWidth}
                    updateObjectWithValue={(object, value) => { object.lineWidth = value }}
                    renderField={({ value, onChange }) => (
                      <NumberInputField
                        name="线条宽度"
                        min={0}
                        max={Math.hypot(sceneWidth * 2, sceneHeight * 2)}
                        step={10}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </ObjectPropertyFieldGroup>
              <ObjectPropertyField
                availableFor={object => object.type === StrategyBoardObjectType.MechanicDonutAoE}
                getValueFromObject={object => object.innerRadius}
                updateObjectWithValue={(object, value) => { object.innerRadius = value }}
                renderField={({ value, onChange }) => (
                  <NumberInputField
                    name="环形范围"
                    min={0}
                    max={255}
                    step={10}
                    value={value}
                    onChange={onChange}
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
                renderField={({ value, onChange }) => (
                  <NumberInputField
                    name="范围角度"
                    min={0}
                    max={360}
                    step={10}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => object.type === StrategyBoardObjectType.MechanicLineStack}
                getValueFromObject={object => object.displayCount}
                updateObjectWithValue={(object, value) => { object.displayCount = value }}
                renderField={({ value, onChange }) => (
                  <NumberInputField
                    name="显示数量"
                    min={1}
                    max={63}
                    step={1}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <ObjectPropertyFieldGroup availableFor={object => object.type === StrategyBoardObjectType.MechanicLinearKnockback}>
                <div className="grid grid-cols-2 gap-4">
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.MechanicLinearKnockback}
                    getValueFromObject={object => object.displayCount.horizontal}
                    updateObjectWithValue={(object, value) => { object.displayCount.horizontal = value }}
                    renderField={({ value, onChange }) => (
                      <NumberInputField
                        name="横向数量"
                        min={1}
                        max={63}
                        step={1}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  <ObjectPropertyField
                    availableFor={object => object.type === StrategyBoardObjectType.MechanicLinearKnockback}
                    getValueFromObject={object => object.displayCount.vertical}
                    updateObjectWithValue={(object, value) => { object.displayCount.vertical = value }}
                    renderField={({ value, onChange }) => (
                      <NumberInputField
                        name="纵向数量"
                        min={1}
                        max={63}
                        step={1}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </ObjectPropertyFieldGroup>
              <ObjectPropertyField
                availableFor={object => object.type === StrategyBoardObjectType.Text}
                getValueFromObject={object => object.text}
                updateObjectWithValue={(object, value) => { object.text = value }}
                renderField={({ value, onChange }) => (
                  <InputField
                    name="文本"
                    description="最多30字符，汉字及全角符号算作3字符"
                    maxBytes={30}
                    value={value}
                    onChange={onChange}
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
                renderField={({ value, onChange }) => (
                  <ColorSelectField
                    name="颜色"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <ObjectPropertyField
                availableFor={object => object.type !== StrategyBoardObjectType.Text}
                getValueFromObject={object => object.transparency}
                updateObjectWithValue={(object, value) => { object.transparency = value }}
                renderField={({ value, onChange }) => (
                  <NumberInputField
                    name="透明度"
                    min={0}
                    max={100}
                    step={10}
                    value={value}
                    onChange={onChange}
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
