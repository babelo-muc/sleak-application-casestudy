import { useState } from 'react'
import type { TranscriptLine } from '@/data/mockData'
import { MessageSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface InteractiveTranscriptProps {
    transcript: TranscriptLine[]
    currentTime: number
    onSeek: (time: number) => void
}

export function InteractiveTranscript({ transcript, currentTime, onSeek }: InteractiveTranscriptProps) {
    const [notes, setNotes] = useState<Record<number, string>>({})
    const [hoveredLine, setHoveredLine] = useState<number | null>(null)

    // De-saturated highlight styles - transparent bg with solid left border
    const getHighlightClass = (highlightType?: string) => {
        switch (highlightType) {
            case 'objection':
                return 'bg-destructive/5 border-l-4 border-l-destructive'
            case 'signal':
                return 'bg-topic-next-steps/5 border-l-4 border-l-topic-next-steps'
            case 'discovery':
                return 'bg-topic-discovery/5 border-l-4 border-l-topic-discovery'
            case 'next-steps':
                return 'bg-topic-next-steps/5 border-l-4 border-l-topic-next-steps'
            default:
                return 'border-l-4 border-l-transparent'
        }
    }

    const isActiveLine = (line: TranscriptLine, index: number) => {
        const nextLine = transcript[index + 1]
        const endTime = nextLine?.startSeconds ?? line.startSeconds + 30
        return currentTime >= line.startSeconds && currentTime < endTime
    }

    return (
        <TooltipProvider>
            <div className="card-elevated flex h-full flex-col">
                <div className="border-border border-b px-6 py-4">
                    <h2 className="text-foreground text-lg font-semibold">Transcript</h2>
                    <p className="text-muted-foreground mt-0.5 text-sm">Click any line to jump</p>
                </div>
                <ScrollArea className="flex-1">
                    <div className="py-2">
                        {transcript.map((line, index) => {
                            const isActive = isActiveLine(line, index)
                            const hasNote = notes[index]
                            const isMe = line.speaker === 'Me'

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        'group relative cursor-pointer transition-all',
                                        getHighlightClass(line.highlightType),
                                        isActive && 'bg-primary/5',
                                        !line.highlightType && !isActive && 'hover:bg-muted/30',
                                    )}
                                    onClick={() => onSeek(line.startSeconds)}
                                    onMouseEnter={() => setHoveredLine(index)}
                                    onMouseLeave={() => setHoveredLine(null)}
                                >
                                    <div
                                        className={cn(
                                            'flex items-start gap-3 px-6 py-3',
                                            isMe && 'pl-10', // Indent "Me" rows
                                        )}
                                    >
                                        {/* Speaker indicator */}
                                        <div
                                            className={cn(
                                                'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                                                isMe
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted-foreground/20 text-muted-foreground',
                                            )}
                                        >
                                            {isMe ? 'M' : 'P'}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-0.5 flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium',
                                                        isMe ? 'text-primary' : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {line.speaker}
                                                </span>
                                                <span className="text-muted-foreground/60 text-[10px]">
                                                    {line.timestamp}
                                                </span>
                                                {line.highlightType && (
                                                    <span
                                                        className={cn(
                                                            'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                                            line.highlightType === 'objection' && 'text-destructive',
                                                            line.highlightType === 'signal' && 'text-topic-next-steps',
                                                            line.highlightType === 'discovery' &&
                                                                'text-topic-discovery',
                                                            line.highlightType === 'next-steps' &&
                                                                'text-topic-next-steps',
                                                        )}
                                                    >
                                                        {line.highlightType === 'signal'
                                                            ? '● Signal'
                                                            : `● ${line.highlightType.charAt(0).toUpperCase() + line.highlightType.slice(1)}`}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-sm leading-relaxed',
                                                    isActive ? 'text-foreground' : 'text-muted-foreground',
                                                )}
                                            >
                                                {line.text}
                                            </p>

                                            {/* Note display */}
                                            {hasNote && (
                                                <div className="text-muted-foreground bg-muted/30 mt-2 flex items-start gap-2 rounded p-2 text-xs">
                                                    <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0" />
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
                                                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            const note = prompt('Add a note:')
                                                            if (note) {
                                                                setNotes((prev) => ({ ...prev, [index]: note }))
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
                                        <div className="bg-primary absolute top-1/2 right-0 h-8 w-1 -translate-y-1/2 rounded-l" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    )
}
