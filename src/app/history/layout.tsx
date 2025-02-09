import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Historial - YouTube Clone',
  description: 'Videos que has visto en YouTube Clone',
}

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
