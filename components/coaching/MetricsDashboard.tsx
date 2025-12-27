import { AlertTriangle, MessageSquare, Clock, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CallMetrics } from '@/data/mockData';

interface MetricsDashboardProps {
  metrics: CallMetrics;
  previousMetrics?: CallMetrics;
}

// Mock previous call metrics for comparison
const defaultPreviousMetrics: CallMetrics = {
  talkRatio: 48,
  wordsPerMinute: 138,
  longestMonologue: '2m 50s',
  longestMonologueSeconds: 170,
  questionScore: 6,
  openQuestions: 4,
  closedQuestions: 3,
};

export function MetricsDashboard({ metrics, previousMetrics = defaultPreviousMetrics }: MetricsDashboardProps) {
  const listenRatio = 100 - metrics.talkRatio;
  const talkWarning = metrics.talkRatio > 60;
  const monologueWarning = metrics.longestMonologueSeconds > 120;

  // Calculate deltas
  const talkDelta = metrics.talkRatio - previousMetrics.talkRatio;
  const paceDelta = metrics.wordsPerMinute - previousMetrics.wordsPerMinute;
  const monologueDelta = metrics.longestMonologueSeconds - previousMetrics.longestMonologueSeconds;
  const questionDelta = metrics.questionScore - previousMetrics.questionScore;

  const DeltaIndicator = ({ delta, inverted = false, unit = '' }: { delta: number; inverted?: boolean; unit?: string }) => {
    const isPositive = inverted ? delta < 0 : delta > 0;
    const isNegative = inverted ? delta > 0 : delta < 0;
    const absValue = Math.abs(delta);
    
    if (delta === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
          <Minus className="h-3 w-3" />
          <span>Same</span>
        </span>
      );
    }
    
    return (
      <span className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isPositive && 'text-topic-next-steps',
        isNegative && 'text-destructive'
      )}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{isPositive ? '↓' : '↑'} {absValue}{unit}</span>
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="card-elevated p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Talk / Listen Ratio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Talk / Listen
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ideal: 40-50% You, 50-60% Prospect</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
              <div
                className={cn(
                  'transition-all',
                  talkWarning ? 'bg-destructive' : 'bg-speaker-me'
                )}
                style={{ width: `${metrics.talkRatio}%` }}
              />
              <div
                className="bg-speaker-prospect"
                style={{ width: `${listenRatio}%` }}
              />
            </div>
            <div className="flex items-baseline justify-between">
              <span className={cn(
                'text-lg font-semibold',
                talkWarning ? 'text-destructive' : 'text-foreground'
              )}>
                {metrics.talkRatio}%
                <span className="text-sm font-normal text-muted-foreground ml-1">You</span>
              </span>
              <DeltaIndicator delta={talkDelta} inverted unit="%" />
            </div>
          </div>

          {/* Pace (WPM) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pace
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optimal: 120-150 words per minute</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-end justify-center gap-0.5 h-6">
              {[...Array(8)].map((_, i) => {
                const threshold = 80 + (i * 15);
                const isActive = metrics.wordsPerMinute >= threshold;
                const isOptimal = threshold >= 120 && threshold <= 150;
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-2 rounded-sm transition-colors',
                      isActive 
                        ? isOptimal ? 'bg-primary' : 'bg-muted-foreground'
                        : 'bg-muted'
                    )}
                    style={{ height: `${40 + i * 8}%` }}
                  />
                );
              })}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold text-foreground">
                {metrics.wordsPerMinute}
                <span className="text-sm font-normal text-muted-foreground ml-1">WPM</span>
              </span>
              <DeltaIndicator delta={paceDelta} />
            </div>
          </div>

          {/* Longest Monologue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Longest Monologue
              </span>
              {monologueWarning && (
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              )}
            </div>
            <div className={cn(
              'text-2xl font-bold text-center',
              monologueWarning ? 'text-destructive' : 'text-foreground'
            )}>
              {metrics.longestMonologue}
            </div>
            <div className="flex items-center justify-center">
              <DeltaIndicator delta={monologueDelta} inverted unit="s" />
            </div>
          </div>

          {/* Question Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Question Quality
              </span>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold text-foreground">{metrics.questionScore}</span>
              <span className="text-lg text-muted-foreground">/ 10</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-xs">
                <span className="text-muted-foreground">
                  {metrics.openQuestions} open
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-muted-foreground">
                  {metrics.closedQuestions} closed
                </span>
              </div>
              <DeltaIndicator delta={questionDelta} />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
