import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, AlertTriangle, HelpCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TimelineSegment, TimelinePin } from '@/data/mockData';

interface GameTapePlayerProps {
  audioUrl: string;
  durationSeconds: number;
  segments: TimelineSegment[];
  pins: TimelinePin[];
  currentTime: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function GameTapePlayer({
  audioUrl,
  durationSeconds,
  segments,
  pins,
  currentTime,
  onTimeChange,
  isPlaying,
  onPlayPause,
}: GameTapePlayerProps) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate mock waveform data
  const waveformBars = useMemo(() => {
    const bars = [];
    const numBars = 150;
    for (let i = 0; i < numBars; i++) {
      const height = 15 + Math.random() * 70;
      bars.push(height);
    }
    return bars;
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleSegmentClick = (startSeconds: number) => {
    onTimeChange(startSeconds);
    if (audioRef.current) {
      audioRef.current.currentTime = startSeconds;
    }
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(durationSeconds, currentTime + seconds));
    onTimeChange(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / durationSeconds) * 100;

  const getPinIcon = (type: TimelinePin['type']) => {
    switch (type) {
      case 'missed-opportunity':
        return AlertTriangle;
      case 'weak-question':
        return HelpCircle;
      case 'strong-pivot':
        return Zap;
    }
  };

  const getPinColor = (type: TimelinePin['type']) => {
    switch (type) {
      case 'missed-opportunity':
        return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'weak-question':
        return 'text-muted-foreground bg-muted border-border';
      case 'strong-pivot':
        return 'text-topic-next-steps bg-topic-next-steps-light border-topic-next-steps/30';
    }
  };

  return (
    <TooltipProvider>
      <div className="card-elevated p-8">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={(e) => onTimeChange(e.currentTarget.currentTime)}
        />

        {/* Header with Legend */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full shadow-md"
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <div>
              <span className="text-lg font-semibold text-foreground">
                {formatTime(currentTime)}
              </span>
              <span className="text-muted-foreground"> / {formatTime(durationSeconds)}</span>
            </div>
          </div>
          
          {/* Compact Legend - Top Right */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-speaker-me" />
              <span>Me</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-speaker-prospect" />
              <span>Prospect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-destructive/60" />
              <span>Objection</span>
            </div>
          </div>
        </div>

        {/* Waveform Visualization - Full Width with uniform coordinate system */}
        <div 
          className="relative h-24 w-full overflow-hidden rounded-lg bg-muted/20 cursor-pointer mb-3"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            handleSegmentClick(percent * durationSeconds);
          }}
        >
          <div className="absolute inset-0 flex justify-between items-end">
            {waveformBars.map((height, i) => {
              // Calculate bar position as percentage of total bars
              const barStartPercent = (i / waveformBars.length) * 100;
              const barEndPercent = ((i + 1) / waveformBars.length) * 100;
              const isActive = barEndPercent <= progressPercent;
              const isPartiallyActive = barStartPercent <= progressPercent && progressPercent < barEndPercent;
              
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 mx-px rounded-full transition-colors duration-75',
                    isActive || isPartiallyActive ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Full-Width DNA Strip - Talk Ratio Layer */}
        <div className="relative mb-3">
          <div className="flex h-4 rounded overflow-hidden">
            {segments.map((segment, i) => {
              const widthPercent = ((segment.endSeconds - segment.startSeconds) / durationSeconds) * 100;
              
              // Determine color based on speaker and topic
              let bgColor = segment.speaker === 'Me' ? 'bg-speaker-me' : 'bg-speaker-prospect';
              if (segment.topic === 'objection') {
                bgColor = 'bg-destructive';
              } else if (segment.topic === 'discovery') {
                bgColor = 'bg-topic-discovery';
              } else if (segment.topic === 'next-steps') {
                bgColor = 'bg-topic-next-steps';
              }
              
              return (
                <button
                  key={i}
                  onClick={() => handleSegmentClick(segment.startSeconds)}
                  className={cn(
                    'h-full transition-opacity hover:opacity-80',
                    bgColor
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              );
            })}
          </div>
          
          {/* Current position indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Annotation Rail - Separate from DNA Strip */}
        <div className="relative h-10 mb-6">
          {pins.map((pin, i) => {
            const leftPercent = (pin.timestampSeconds / durationSeconds) * 100;
            const Icon = getPinIcon(pin.type);
            const isHovered = hoveredPin === i;
            
            return (
              <div
                key={i}
                className="absolute"
                style={{ left: `${leftPercent}%` }}
              >
                {/* Leader line */}
                <div className="absolute -top-3 left-1/2 w-px h-3 bg-border -translate-x-1/2" />
                
                {/* Pin button */}
                <Tooltip open={isHovered}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSegmentClick(pin.timestampSeconds)}
                      onMouseEnter={() => setHoveredPin(i)}
                      onMouseLeave={() => setHoveredPin(null)}
                      className={cn(
                        'transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-transform hover:scale-110',
                        getPinColor(pin.type)
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
            );
          })}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => skip(-10)}>
                  <SkipBack className="h-4 w-4 mr-1" />
                  10s
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip back 10s</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => skip(10)}>
                  10s
                  <SkipForward className="h-4 w-4 ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip forward 10s</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(v) => {
                setVolume(v[0]);
                setIsMuted(false);
              }}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
