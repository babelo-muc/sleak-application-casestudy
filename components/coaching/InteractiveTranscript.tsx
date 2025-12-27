import { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TranscriptLine } from '@/data/mockData';

interface InteractiveTranscriptProps {
  transcript: TranscriptLine[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export function InteractiveTranscript({
  transcript,
  currentTime,
  onSeek,
}: InteractiveTranscriptProps) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  // De-saturated highlight styles - transparent bg with solid left border
  const getHighlightClass = (highlightType?: string) => {
    switch (highlightType) {
      case 'objection':
        return 'bg-destructive/5 border-l-4 border-l-destructive';
      case 'signal':
        return 'bg-topic-next-steps/5 border-l-4 border-l-topic-next-steps';
      case 'discovery':
        return 'bg-topic-discovery/5 border-l-4 border-l-topic-discovery';
      case 'next-steps':
        return 'bg-topic-next-steps/5 border-l-4 border-l-topic-next-steps';
      default:
        return 'border-l-4 border-l-transparent';
    }
  };

  const isActiveLine = (line: TranscriptLine, index: number) => {
    const nextLine = transcript[index + 1];
    const endTime = nextLine?.timestampSeconds ?? line.timestampSeconds + 30;
    return currentTime >= line.timestampSeconds && currentTime < endTime;
  };

  return (
    <TooltipProvider>
      <div className="card-elevated h-full flex flex-col">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Transcript</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Click any line to jump</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-2">
            {transcript.map((line, index) => {
              const isActive = isActiveLine(line, index);
              const hasNote = notes[index];
              const isMe = line.speaker === 'Me';
              
              return (
                <div
                  key={index}
                  className={cn(
                    'group relative cursor-pointer transition-all',
                    getHighlightClass(line.highlightType),
                    isActive && 'bg-primary/5',
                    !line.highlightType && !isActive && 'hover:bg-muted/30'
                  )}
                  onClick={() => onSeek(line.timestampSeconds)}
                  onMouseEnter={() => setHoveredLine(index)}
                  onMouseLeave={() => setHoveredLine(null)}
                >
                  <div className={cn(
                    'flex items-start gap-3 py-3 px-6',
                    isMe && 'pl-10' // Indent "Me" rows
                  )}>
                    {/* Speaker indicator */}
                    <div
                      className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      )}
                    >
                      {isMe ? 'M' : 'P'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          'text-xs font-medium',
                          isMe ? 'text-primary' : 'text-muted-foreground'
                        )}>
                          {line.speaker}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {line.timestamp}
                        </span>
                        {line.highlightType && (
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-medium',
                            line.highlightType === 'objection' && 'text-destructive',
                            line.highlightType === 'signal' && 'text-topic-next-steps',
                            line.highlightType === 'discovery' && 'text-topic-discovery',
                            line.highlightType === 'next-steps' && 'text-topic-next-steps',
                          )}>
                            {line.highlightType === 'signal' ? '● Signal' : 
                             `● ${line.highlightType.charAt(0).toUpperCase() + line.highlightType.slice(1)}`}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        'text-sm leading-relaxed',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {line.text}
                      </p>
                      
                      {/* Note display */}
                      {hasNote && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded p-2">
                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{notes[index]}</span>
                        </div>
                      )}
                    </div>

                    {/* Add note button */}
                    {hoveredLine === index && !hasNote && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              const note = prompt('Add a note:');
                              if (note) {
                                setNotes(prev => ({ ...prev, [index]: note }));
                              }
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add Note</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Active line indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
