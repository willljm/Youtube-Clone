'use client'

import { Suspense } from 'react'
import EditorClient from './EditorClient'
import Loading from './loading'

export default function EditorPage({ params }: { params: { videoId: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <EditorClient videoId={params.videoId} />
    </Suspense>
  )
}
