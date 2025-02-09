'use client'

import { useState, useRef } from 'react'
import ChevronLeft from './ChevronLeft'

interface FilterSliderProps {
  variant?: 'main' | 'video'
}

export default function FilterSlider({ variant = 'main' }: FilterSliderProps) {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const containerRef = useRef<HTMLDivElement>(null)

  const mainFilters = ['Todos', 'Música', 'En vivo', 'Videojuegos', 'Programación', 'Deportes', 'Noticias', 'Gaming', "React", "Animacion", "Podcast", "Gym", "Comida", "Comedia", "Fisiculturismo"]
  const videoFilters = ['Todos', 'Videos relacionados', 'Para ti']

  const filters = variant === 'main' ? mainFilters : videoFilters

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 200
      const newScrollLeft = direction === 'left' 
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount
      
      containerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent px-4 h-full"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      
      <div 
        ref={containerRef}
        className="flex gap-3 py-1 mx-8 overflow-x-hidden scroll-smooth"
      >
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-3 py-1.5 rounded-lg whitespace-nowrap text-sm
              transition-all duration-200
              ${activeFilter === filter 
                ? 'bg-white text-black font-medium' 
                : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent px-4 h-full"
      >
        <ChevronLeft className="w-5 h-5 text-white rotate-180" />
      </button>
    </div>
  )
}
