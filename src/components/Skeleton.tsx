'use client'

import { cn } from '@/lib/utils'
import RelatedVideos from './RelatedVideos'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-[#272727]', className)} {...props} />
  )
}

export function VideoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-zinc-800 rounded-xl mb-4" />
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800" />
        <div className="flex-1">
          <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-zinc-800 rounded w-1/2 mb-1" />
          <div className="h-3 bg-zinc-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function RelatedVideoSkeleton() {
  return (
    <div className="flex gap-2 p-1">
      <Skeleton className="h-24 w-40 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function WatchVideoSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-16">
      {/* Video Player Skeleton */}
      <div className="w-full">
        <div className="relative w-full md:h-[calc(100vh-56px)]">
          <div className="w-full h-full aspect-video md:aspect-auto bg-[#272727] animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-[1800px] mx-auto px-4 md:px-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="py-4">
            {/* Title */}
            <div className="h-6 bg-[#272727] rounded-lg w-3/4 mb-4 animate-pulse" />
            
            {/* Channel Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#272727] animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-[#272727] rounded w-1/4 mb-2 animate-pulse" />
                <div className="h-3 bg-[#272727] rounded w-1/6 animate-pulse" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-[#272727] rounded w-full animate-pulse" />
              <div className="h-4 bg-[#272727] rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-[#272727] rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Related Videos */}
        <div className="lg:w-[400px] lg:flex-shrink-0">
          <RelatedVideos currentVideoId="" />
        </div>
      </div>
    </div>
  )
}

export function CommentSkeleton() {
  return (
    <div className="animate-pulse flex gap-4">
      <div className="w-10 h-10 rounded-full bg-zinc-800" />
      <div className="flex-1">
        <div className="h-4 bg-zinc-800 rounded w-1/4 mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
      </div>
    </div>
  )
}
