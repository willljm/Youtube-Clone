'use client'

import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { supabase } from '@/lib/supabase'
import { FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa'
import { IoMdVolumeHigh, IoMdVolumeOff } from 'react-icons/io'
import { useVideo } from '@/context/VideoContext'

interface VideoPlayerProps {
  url: string
  thumbnailUrl?: string
  autoPlay?: boolean
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function VideoPlayer({ url, thumbnailUrl, autoPlay = false }: VideoPlayerProps) {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime } = useVideo()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log('Video URL:', url)
    console.log('Thumbnail URL:', thumbnailUrl)
  }, [url, thumbnailUrl])

  useEffect(() => {
    if (!videoRef.current) return

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setShowControls(true)
    }

    const video = videoRef.current
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Error al reproducir el video:', error)
          setIsPlaying(false)
        })
      }
    } else {
      try {
        videoRef.current.pause()
      } catch (error) {
        console.error('Error al pausar el video:', error)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    let mounted = true;
    let playAttempt: ReturnType<typeof setTimeout>;

    const initializeVideo = async () => {
      if (!videoRef.current || !mounted) return;

      try {
        if (autoPlay) {
          // Intentar reproducir después de un pequeño delay
          playAttempt = setTimeout(async () => {
            try {
              await videoRef.current?.play();
              setIsPlaying(true);
            } catch (error) {
              if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error en reproducción:', error);
              }
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error en inicialización:', error);
      }
    };

    initializeVideo();

    return () => {
      mounted = false;
      clearTimeout(playAttempt);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [url]);

  useEffect(() => {
    if (!videoRef.current) return;

    const handlePlaying = () => {
      console.log('Video empezó a reproducirse');
      setIsLoading(false);
    };

    const handleSeeking = () => {
      console.log('Video buscando...');
      setIsLoading(true);
    };

    const handleSeeked = () => {
      console.log('Video encontró posición');
      setIsLoading(false);
    };

    const video = videoRef.current;
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  const handleVideoClick = (e: React.MouseEvent) => {
    // Don't toggle play/pause if clicking on controls
    if ((e.target as HTMLElement).closest('.video-controls')) {
      return
    }

    setIsPlaying(!isPlaying)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2000)
    }
  }

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false)
    }
  }

  const handleVideoError = (e: any) => {
    console.error('Error en el video:', e)
    setError('Error al cargar el video')
    setIsLoading(false)
  }

  const handleLoadedData = () => {
    console.log('Video loaded');
    setIsLoading(false);
  }

  const handleCanPlayThrough = () => {
    console.log('Video can play through');
    setIsLoading(false);
  }

  const handleWaiting = () => {
    console.log('Video waiting');
    setIsLoading(true);
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setProgress((videoRef.current.currentTime / duration) * 100)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const progressBar = e.currentTarget
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
      const percentage = (clickPosition / progressBar.offsetWidth)
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setProgress(percentage * 100)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Error al cambiar pantalla completa:', error)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 transition-opacity duration-300">
          <div className="w-12 h-12 border-4 border-t-red-500 border-red-200 rounded-full animate-spin" />
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full rounded-xl"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onCanPlayThrough={handleCanPlayThrough}
        onWaiting={handleWaiting}
        onError={handleVideoError}
        onClick={handleVideoClick}
        playsInline
        poster={thumbnailUrl}
        autoPlay={autoPlay}
      >
        <source src={url} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Controles */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Barra de progreso */}
        <div
          className="w-full h-1 bg-gray-600 cursor-pointer mb-4 rounded-full overflow-hidden"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-600 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isMuted ? <IoMdVolumeOff size={24} /> : <IoMdVolumeHigh size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-red-500"
              />
            </div>

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-red-500 transition-colors"
          >
            {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
