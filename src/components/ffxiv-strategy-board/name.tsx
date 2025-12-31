'use client'

import { ChangeEventHandler, FocusEventHandler, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'

import { useStrategyBoard } from './context'

export interface StrategyBoardNameProps {
  readOnly?: boolean
}

export function StrategyBoardName(props: StrategyBoardNameProps) {
  const { readOnly } = props

  const { scene, setName } = useStrategyBoard()

  const [nameDraft, setNameDraft] = useState<string | null>(null)

  const handleNameInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    setNameDraft(event.target.value)
  }, [])
  const handleNameInputFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setNameDraft(scene.name)
  }, [scene.name])
  const handleNameInputBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (nameDraft) setName(nameDraft)
    setNameDraft(null)
  }, [setName, nameDraft])

  return readOnly ? (
    <p className="max-w-120 border-x border-transparent px-2 text-lg/8 font-semibold text-ellipsis">{scene.name}</p>
  ) : (
    <Input
      className="max-w-120 not-hover:not-focus:border-transparent px-2 text-lg/8 md:text-lg/8 font-semibold text-ellipsis dark:not-hover:not-focus:bg-transparent"
      value={nameDraft ?? scene.name}
      spellCheck={false}
      readOnly={readOnly}
      onChange={handleNameInputChange}
      onFocus={handleNameInputFocus}
      onBlur={handleNameInputBlur}
    />
  )
}
