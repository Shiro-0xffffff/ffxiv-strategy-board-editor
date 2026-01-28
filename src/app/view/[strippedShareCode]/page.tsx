import { Metadata } from 'next'

import { ViewPageContent } from './components'

export const metadata: Metadata = {
  title: null,
}

export default function ViewPage() {
  return (
    <ViewPageContent />
  )
}
