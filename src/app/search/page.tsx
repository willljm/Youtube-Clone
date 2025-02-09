import React from 'react'
import dynamic from 'next/dynamic'
import { Search } from 'lucide-react'
import SearchPageClient from './SearchPageClient'

export const metadata = {
  title: 'Búsqueda - YouTube Clone',
  description: 'Busca videos en YouTube Clone'
}

export default function SearchPage() {
  return <SearchPageClient />
}
