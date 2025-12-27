import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Drill, ProgressPoint } from '@/data/mockData';

interface ActionPlanFooterProps {
  drills: Drill[];
  progressHistory: ProgressPoint[];
}

export function ActionPlanFooter({ drills, progressHistory }: ActionPlanFooterProps) {
  // Calculate sparkline points
  const maxScore = Math.max(...progressHistory.map(p => p.discoveryScore));
  const minScore = Math.min(...progressHistory.map(p => p.discoveryScore));
  const range = maxScore - minScore || 1;
  
  const sparklinePoints = progressHistory.map((point, i) => {
    const x = (i / (progressHistory.length - 1)) * 100;
    const y = 100 - ((point.discoveryScore - minScore) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  const latestScore = progressHistory[progressHistory.length - 1]?.discoveryScore ?? 0;
  const previousScore = progressHistory[progressHistory.length - 2]?.discoveryScore ?? 0;
  const trend = latestScore - previousScore;

  return (
    <TooltipProvider>
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Action Plan</h3>
        </div>

        <div className="grid md:grid-cols-[1fr,auto] gap-6">
          {/* Drills */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Practice Drills for Next Call
            </span>
            <div className="mt-3 space-y-2">
              {drills.map((drill) => (
                <div
                  key={drill.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg transition-colors',
                    drill.completed ? 'bg-topic-next-steps-light' : 'bg-muted/30'
                  )}
                >
                  {drill.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-topic-next-steps flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <span className={cn(
                    'text-sm',
                    drill.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                    {drill.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Sparkline */}
          <div className="w-full md:w-64">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Discovery Score Trend
            </span>
            <div className="mt-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{latestScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <span className={cn(
                      'text-sm font-medium px-2 py-0.5 rounded-full',
                      trend > 0 
                        ? 'text-topic-next-steps bg-topic-next-steps-light' 
                        : trend < 0 
                          ? 'text-topic-objection bg-topic-objection-light'
                          : 'text-muted-foreground bg-muted'
                    )}>
                      {trend > 0 ? '+' : ''}{trend}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change from previous call</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Sparkline SVG */}
              <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.5" />
                
                {/* Area under the line */}
                <polygon
                  points={`0,100 ${sparklinePoints} 100,100`}
                  fill="hsl(var(--primary))"
                  fillOpacity="0.1"
                />
                
                {/* Line */}
                <polyline
                  points={sparklinePoints}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Current point */}
                <circle
                  cx="100"
                  cy={100 - ((latestScore - minScore) / range) * 80}
                  r="3"
                  fill="hsl(var(--primary))"
                />
              </svg>
              
              {/* Labels */}
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                {progressHistory.map((point, i) => (
                  <span key={i}>{point.callDate}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
