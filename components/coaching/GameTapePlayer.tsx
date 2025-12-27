import { useEffect, useMemo, useRef, useState } from 'react'
import type { TimelinePin, TimelineSegment, TranscriptLine } from '@/data/mockData'
import { AlertTriangle, HelpCircle, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface GameTapePlayerProps {
    audioUrl: string
    durationSeconds: number
    segments: TimelineSegment[]
    pins: TimelinePin[]
    transcript?: TranscriptLine[]
    currentTime: number
    onTimeChange: (time: number) => void
    isPlaying: boolean
    onPlayPause: () => void
}

export function GameTapePlayer({
    audioUrl,
    durationSeconds,
    segments,
    pins,
    transcript,
    currentTime,
    onTimeChange,
    isPlaying,
    onPlayPause,
}: GameTapePlayerProps) {
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [hoveredPin, setHoveredPin] = useState<number | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Generate mock waveform data
    const waveformBars = useMemo(() => {
        const bars = []
        const numBars = 150
        for (let i = 0; i < numBars; i++) {
            const height = 15 + Math.random() * 70
            bars.push(height)
        }
        return bars
    }, [])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume / 100
        }
    }, [volume, isMuted])

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play()
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying])

    const handleSegmentClick = (startSeconds: number) => {
        onTimeChange(startSeconds)
        if (audioRef.current) {
            audioRef.current.currentTime = startSeconds
        }
    }

    const skip = (seconds: number) => {
        const newTime = Math.max(0, Math.min(durationSeconds, currentTime + seconds))
        onTimeChange(newTime)
        if (audioRef.current) {
            audioRef.current.currentTime = newTime
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progressPercent = (currentTime / durationSeconds) * 100

    const getPinIcon = (type: TimelinePin['type']) => {
        switch (type) {
            case 'missed-opportunity':
                return AlertTriangle
            case 'weak-question':
                return HelpCircle
            case 'strong-pivot':
                return Zap
        }
    }

    const getPinColor = (type: TimelinePin['type']) => {
        switch (type) {
            case 'missed-opportunity':
                return 'text-destructive bg-destructive/10 border-destructive/30'
            case 'weak-question':
                return 'text-muted-foreground bg-muted border-border'
            case 'strong-pivot':
                return 'text-topic-next-steps bg-topic-next-steps-light border-topic-next-steps/30'
        }
    }

    return (
        <TooltipProvider>
            <div className="card-elevated p-8">
                <audio ref={audioRef} src={audioUrl} onTimeUpdate={(e) => onTimeChange(e.currentTarget.currentTime)} />

                {/* Header with Legend */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="default"
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-md"
                            onClick={onPlayPause}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                        </Button>
                        <div>
                            <span className="text-foreground text-lg font-semibold">{formatTime(currentTime)}</span>
                            <span className="text-muted-foreground"> / {formatTime(durationSeconds)}</span>
                        </div>
                    </div>

                    {/* Compact Legend - Top Right */}
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="bg-speaker-me h-2.5 w-2.5 rounded-sm" />
                            <span>Me</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="bg-speaker-prospect h-2.5 w-2.5 rounded-sm" />
                            <span>Prospect</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="bg-destructive/60 h-2.5 w-2.5 rounded-sm" />
                            <span>Objection</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="bg-topic-next-steps h-2.5 w-2.5 rounded-sm" />
                            <span>Signal</span>
                        </div>
                    </div>
                </div>

                {/* Waveform Visualization - Full Width with uniform coordinate system */}
                <div
                    className="bg-muted/20 relative mb-3 h-24 w-full cursor-pointer overflow-hidden rounded-lg"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const percent = x / rect.width
                        handleSegmentClick(percent * durationSeconds)
                    }}
                >
                    <div className="absolute inset-0 flex items-end justify-between">
                        {waveformBars.map((height, i) => {
                            // Calculate bar position as percentage of total bars
                            const barStartPercent = (i / waveformBars.length) * 100
                            const barEndPercent = ((i + 1) / waveformBars.length) * 100
                            const isActive = barEndPercent <= progressPercent
                            const isPartiallyActive =
                                barStartPercent <= progressPercent && progressPercent < barEndPercent

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        'mx-px flex-1 rounded-full transition-colors duration-75',
                                        isActive || isPartiallyActive ? 'bg-primary' : 'bg-muted-foreground/20',
                                    )}
                                    style={{ height: `${height}%` }}
                                />
                            )
                        })}
                    </div>
                    {/* Playhead */}
                    <div
                        className="bg-foreground pointer-events-none absolute top-0 bottom-0 z-10 w-0.5"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>

                {/* Full-Width DNA Strip - Talk Ratio Layer */}
                <div className="relative mb-3">
                    <div className="flex h-4 overflow-hidden rounded">
                        {(() => {
                            // If a transcript is provided prefer deriving segment timing and highlight info from it
                            const renderSegments =
                                transcript && transcript.length
                                    ? transcript.map((line, idx) => {
                                          const startSeconds = line.timestampSeconds
                                          const endSeconds =
                                              transcript[idx + 1]?.timestampSeconds ??
                                              Math.min(durationSeconds, startSeconds + 30)
                                          return {
                                              startSeconds,
                                              endSeconds,
                                              speaker: line.speaker,
                                              highlightType: line.highlightType,
                                          } as any
                                      })
                                    : segments.map((s) => ({ ...s, highlightType: undefined }) as any)

                            return renderSegments.map((segment: any, i: number) => {
                                const widthPercent =
                                    ((segment.endSeconds - segment.startSeconds) / durationSeconds) * 100

                                // Determine color based on speaker and either transcript highlightType or segment.topic
                                let bgColor = segment.speaker === 'Me' ? 'bg-speaker-me' : 'bg-speaker-prospect'
                                const highlight = segment.highlightType ?? segment.topic
                                if (highlight === 'objection') {
                                    bgColor = 'bg-destructive'
                                } else if (highlight === 'discovery') {
                                    bgColor = 'bg-topic-discovery'
                                } else if (highlight === 'signal' || highlight === 'next-steps') {
                                    bgColor = 'bg-topic-next-steps'
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSegmentClick(segment.startSeconds)}
                                        className={cn('h-full transition-opacity hover:opacity-80', bgColor)}
                                        style={{ width: `${widthPercent}%` }}
                                    />
                                )
                            })
                        })()}
                    </div>

                    {/* Current position indicator */}
                    <div
                        className="bg-foreground absolute top-0 bottom-0 z-10 w-0.5"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>

                {/* Annotation Rail - Separate from DNA Strip */}
                <div className="relative mb-6 h-10">
                    {pins.map((pin, i) => {
                        const leftPercent = (pin.timestampSeconds / durationSeconds) * 100
                        const Icon = getPinIcon(pin.type)
                        const isHovered = hoveredPin === i

                        return (
                            <div key={i} className="absolute" style={{ left: `${leftPercent}%` }}>
                                {/* Leader line */}
                                <div className="bg-border absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2" />

                                {/* Pin button */}
                                <Tooltip open={isHovered}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => handleSegmentClick(pin.timestampSeconds)}
                                            onMouseEnter={() => setHoveredPin(i)}
                                            onMouseLeave={() => setHoveredPin(null)}
                                            className={cn(
                                                'flex h-6 w-6 -translate-x-1/2 transform items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-110',
                                                getPinColor(pin.type),
                                            )}
                                        >
                                            <Icon className="h-3 w-3" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-3 w-3 flex-shrink-0" />
                                            <span className="text-xs font-medium">{pin.label}</span>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )
                    })}
                </div>

                {/* Playback Controls */}
                <div className="border-border/50 flex items-center justify-between border-t pt-2">
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => skip(-10)}>
                                    <SkipBack className="mr-1 h-4 w-4" />
                                    10s
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Skip back 10s</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => skip(10)}>
                                    10s
                                    <SkipForward className="ml-1 h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Skip forward 10s</TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={(v) => {
                                setVolume(v[0])
                                setIsMuted(false)
                            }}
                            max={100}
                            step={1}
                            className="w-20"
                        />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
