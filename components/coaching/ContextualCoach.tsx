import { useMemo } from 'react';
import { Copy, RotateCcw, AlertCircle, Play, Lightbulb, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CoachingInsight, Objection } from '@/data/mockData';
import { toast } from 'sonner';

interface ContextualCoachProps {
  insights: CoachingInsight[];
  objections: Objection[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export function ContextualCoach({
  insights,
  objections,
  currentTime,
  onSeek,
}: ContextualCoachProps) {
  // Find the current insight based on playback time
  const currentInsight = useMemo(() => {
    return insights.find(
      insight => currentTime >= insight.timestampSeconds && currentTime < insight.endSeconds
    );
  }, [insights, currentTime]);

  // Get top 3 critical moments for coaching summary
  const criticalMoments = useMemo(() => {
    return insights.slice(0, 3);
  }, [insights]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <TooltipProvider>
      <div className="card-elevated h-full flex flex-col">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Coach</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time feedback</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Current Insight Card OR Coaching Summary */}
            {currentInsight ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Rewind & Rewrite</h3>
                </div>
                
                <div className="space-y-3 bg-muted/20 rounded-lg p-3">
                  {/* What you said - compact */}
                  <div>
                    <p className="text-xs text-muted-foreground italic border-l-2 border-muted-foreground/20 pl-2 line-clamp-2">
                      "{currentInsight.whatYouSaid}"
                    </p>
                  </div>
                  
                  {/* Critique - compact */}
                  <p className="text-xs text-muted-foreground">
                    {currentInsight.critique}
                  </p>
                  
                  {/* Try this instead - FOCAL POINT */}
                  <div className="relative bg-topic-next-steps/10 rounded-lg p-3 border border-topic-next-steps/20">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-topic-next-steps" />
                      <span className="text-xs font-semibold text-topic-next-steps uppercase tracking-wide">
                        Try this
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground pr-8 leading-relaxed">
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
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Coaching Summary</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Top moments to review:
                </p>
                <div className="space-y-2">
                  {criticalMoments.map((insight, i) => (
                    <button
                      key={i}
                      onClick={() => onSeek(insight.timestampSeconds)}
                      className="w-full text-left p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.critique}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1">
                            {Math.floor(insight.timestampSeconds / 60)}:{(insight.timestampSeconds % 60).toString().padStart(2, '0')}
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
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Objections</h3>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {objections.length}
                </span>
              </div>
              
              <div className="space-y-1.5">
                {objections.map((objection) => {
                  const isActive = Math.abs(currentTime - objection.timestampSeconds) < 10;
                  
                  return (
                    <button
                      key={objection.id}
                      onClick={() => onSeek(objection.timestampSeconds)}
                      className={cn(
                        'w-full text-left p-2.5 rounded-lg transition-all',
                        isActive 
                          ? 'bg-destructive/10 ring-1 ring-destructive/30' 
                          : 'bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                          isActive ? 'bg-destructive text-primary-foreground' : 'bg-muted'
                        )}>
                          <Play className="h-2.5 w-2.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-foreground">
                              {objection.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {Math.floor(objection.timestampSeconds / 60)}:{(objection.timestampSeconds % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                            "{objection.quote}"
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
