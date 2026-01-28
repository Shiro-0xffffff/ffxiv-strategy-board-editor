import { Metadata } from 'next'

import { EditPageContent } from './components'

export const metadata: Metadata = {
  title: null,
}

export default function EditPage() {
  return (
    <EditPageContent />
  )
}
