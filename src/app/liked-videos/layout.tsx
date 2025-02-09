import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Videos que me gustan - YouTube Clone',
  description: 'Videos que te han gustado en YouTube Clone',
}

export default function LikedVideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
