import { useMemo } from 'react'
import type { CoachingInsight, Objection } from '@/data/mockData'
import { AlertCircle, Copy, Lightbulb, Play, RotateCcw, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ContextualCoachProps {
    insights: CoachingInsight[]
    objections: Objection[]
    currentTime: number
    onSeek: (time: number) => void
}

export function ContextualCoach({ insights, objections, currentTime, onSeek }: ContextualCoachProps) {
    // Find the current insight based on playback time
    const currentInsight = useMemo(() => {
        return insights.find((insight) => currentTime >= insight.startSeconds && currentTime < insight.endSeconds)
    }, [insights, currentTime])

    // Get top 3 critical moments for coaching summary
    const criticalMoments = useMemo(() => {
        return insights.slice(0, 3)
    }, [insights])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    return (
        <TooltipProvider>
            <div className="card-elevated flex h-full flex-col">
                <div className="border-border border-b px-6 py-4">
                    <h2 className="text-foreground text-lg font-semibold">Coach</h2>
                    <p className="text-muted-foreground mt-0.5 text-sm">Real-time feedback</p>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-4 p-4">
                        {/* Current Insight Card OR Coaching Summary */}
                        {currentInsight ? (
                            <div className="animate-fade-in">
                                <div className="mb-2 flex items-center gap-2">
                                    <RotateCcw className="text-primary h-4 w-4" />
                                    <h3 className="text-foreground text-sm font-semibold">Rewind & Rewrite</h3>
                                </div>

                                <div className="bg-muted/20 space-y-3 rounded-lg p-3">
                                    {/* What you said - compact */}
                                    <div>
                                        <p className="text-muted-foreground border-muted-foreground/20 line-clamp-2 border-l-2 pl-2 text-xs italic">
                                            "{currentInsight.text}"
                                        </p>
                                    </div>

                                    {/* Critique - compact */}
                                    <p className="text-muted-foreground text-xs">{currentInsight.assessment}</p>

                                    {/* Try this instead - FOCAL POINT */}
                                    <div className="bg-topic-next-steps/10 border-topic-next-steps/20 relative rounded-lg border p-3">
                                        <div className="mb-1.5 flex items-center gap-1.5">
                                            <Lightbulb className="text-topic-next-steps h-3.5 w-3.5" />
                                            <span className="text-topic-next-steps text-xs font-semibold tracking-wide uppercase">
                                                Try this
                                            </span>
                                        </div>
                                        <p className="text-foreground pr-8 text-sm leading-relaxed font-medium">
                                            "{currentInsight.tryThisInstead}"
                                        </p>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6"
                                                    onClick={() => copyToClipboard(currentInsight.tryThisInstead)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Copy to clipboard</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Coaching Summary - when paused */
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Star className="text-primary h-4 w-4" />
                                    <h3 className="text-foreground text-sm font-semibold">Coaching Summary</h3>
                                </div>
                                <p className="text-muted-foreground mb-3 text-xs">Top moments to review:</p>
                                <div className="space-y-2">
                                    {criticalMoments.map((insight, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSeek(insight.startSeconds)}
                                            className="bg-muted/30 hover:bg-muted/50 hover:border-primary/20 w-full rounded-lg border border-transparent p-2.5 text-left transition-colors"
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className="bg-primary/10 text-primary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">
                                                        {insight.assessment}
                                                    </p>
                                                    <span className="text-muted-foreground/60 mt-1 text-[10px]">
                                                        {Math.floor(insight.startSeconds / 60)}:
                                                        {(insight.startSeconds % 60).toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Objection Playlist */}
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <AlertCircle className="text-destructive h-4 w-4" />
                                <h3 className="text-foreground text-sm font-semibold">Objections</h3>
                                <span className="text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 text-[10px]">
                                    {objections.length}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {objections.map((objection) => {
                                    const isActive = Math.abs(currentTime - objection.timestampSeconds) < 10

                                    return (
                                        <button
                                            key={objection.id}
                                            onClick={() => onSeek(objection.timestampSeconds)}
                                            className={cn(
                                                'w-full rounded-lg p-2.5 text-left transition-all',
                                                isActive
                                                    ? 'bg-destructive/10 ring-destructive/30 ring-1'
                                                    : 'bg-muted/20 hover:bg-muted/40',
                                            )}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div
                                                    className={cn(
                                                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                                                        isActive
                                                            ? 'bg-destructive text-primary-foreground'
                                                            : 'bg-muted',
                                                    )}
                                                >
                                                    <Play className="h-2.5 w-2.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-0.5 flex items-center gap-2">
                                                        <span className="text-foreground text-xs font-medium">
                                                            {objection.label}
                                                        </span>
                                                        <span className="text-muted-foreground text-[10px]">
                                                            {Math.floor(objection.timestampSeconds / 60)}:
                                                            {(objection.timestampSeconds % 60)
                                                                .toString()
                                                                .padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground line-clamp-1 text-[11px] italic">
                                                        "{objection.quote}"
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    )
}
