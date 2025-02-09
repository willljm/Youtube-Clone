'use client'

import { useState } from 'react'

interface VideoDescriptionProps {
  description: string
  hashtags?: string[]
}

export default function VideoDescription({ description, hashtags = [] }: VideoDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldShowButton = description.length > 50

  // Extraer hashtags del texto si no se proporcionan explícitamente
  const extractedHashtags = description.match(/#[\w-]+/g) || []
  const finalHashtags = hashtags.length > 0 ? hashtags : extractedHashtags

  // Separar la descripción de los hashtags
  const descriptionWithoutHashtags = description.replace(/#[\w-]+/g, '').trim()
  
  const displayedDescription = isExpanded 
    ? descriptionWithoutHashtags 
    : `${descriptionWithoutHashtags.slice(0, 50)}${shouldShowButton ? '...' : ''}`

  return (
    <div className="bg-zinc-800 rounded-xl ">
      <div className="">
        {finalHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {finalHashtags.map((tag, index) => (
              <span key={index} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <p className="text-white whitespace-pre-wrap">
          {displayedDescription}
        </p>

        {shouldShowButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-500 hover:text-blue-400 font-medium"
          >
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
    </div>
  )
}
