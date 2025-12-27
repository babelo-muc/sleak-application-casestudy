import { TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ProgressPoint } from '@/data/mockData';

interface GoalTrackerProps {
  progressHistory: ProgressPoint[];
  goal: string;
  targetValue: number;
}

export function GoalTracker({ progressHistory, goal, targetValue }: GoalTrackerProps) {
  // Calculate sparkline points for a taller chart
  const maxScore = Math.max(...progressHistory.map(p => p.discoveryScore));
  const minScore = Math.min(...progressHistory.map(p => p.discoveryScore));
  const range = maxScore - minScore || 1;
  
  const sparklinePoints = progressHistory.map((point, i) => {
    const x = (i / (progressHistory.length - 1)) * 100;
    const y = 100 - ((point.discoveryScore - minScore) / range) * 70;
    return `${x},${y}`;
  }).join(' ');

  const latestScore = progressHistory[progressHistory.length - 1]?.discoveryScore ?? 0;
  const previousScore = progressHistory[progressHistory.length - 2]?.discoveryScore ?? 0;
  const trend = latestScore - previousScore;

  // Determine status
  const callsMeetingGoal = progressHistory.filter(p => p.discoveryScore >= targetValue).length;
  const totalCalls = progressHistory.length;
  
  let status: 'improving' | 'flat' | 'regressing';
  let statusLabel: string;
  let statusColor: string;
  
  if (trend > 2) {
    status = 'improving';
    statusLabel = 'Improving';
    statusColor = 'bg-topic-next-steps text-primary-foreground';
  } else if (trend < -2) {
    status = 'regressing';
    statusLabel = 'Regressing';
    statusColor = 'bg-destructive text-primary-foreground';
  } else {
    status = 'flat';
    statusLabel = 'Steady';
    statusColor = 'bg-muted text-muted-foreground';
  }

  const verdictText = status === 'improving' 
    ? `You're trending in the right direction. ${callsMeetingGoal} of your last ${totalCalls} calls met the goal.`
    : status === 'regressing'
      ? `Needs attention. Only ${callsMeetingGoal} of your last ${totalCalls} calls met the goal.`
      : `Holding steady. ${callsMeetingGoal} of your last ${totalCalls} calls met the goal.`;

  return (
    <TooltipProvider>
      <div className="card-elevated p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Goal Tracker</h3>
          </div>
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full',
            statusColor
          )}>
            {statusLabel}
          </span>
        </div>

        <div className="grid md:grid-cols-[1fr,1.5fr] gap-6">
          {/* Goal Info */}
          <div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg mb-4">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">Current Goal</span>
              <p className="text-sm font-medium text-foreground mt-1">{goal}</p>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <span className="text-2xl font-bold text-foreground">{callsMeetingGoal}</span>
                <span className="text-sm text-muted-foreground">/{totalCalls}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Calls met goal</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <span className={cn(
                  'text-2xl font-bold',
                  trend > 0 ? 'text-topic-next-steps' : trend < 0 ? 'text-destructive' : 'text-foreground'
                )}>
                  {trend > 0 ? '+' : ''}{trend}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">vs last call</p>
              </div>
            </div>
          </div>

          {/* Tall Sparkline Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Last {totalCalls} Calls
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">{latestScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4">
              {/* Sparkline SVG - Taller */}
              <svg className="w-full h-24" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Target line */}
                <line 
                  x1="0" 
                  y1={100 - ((targetValue - minScore) / range) * 70} 
                  x2="100" 
                  y2={100 - ((targetValue - minScore) / range) * 70} 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                
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
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {progressHistory.map((point, i) => {
                  const x = (i / (progressHistory.length - 1)) * 100;
                  const y = 100 - ((point.discoveryScore - minScore) / range) * 70;
                  const meetsGoal = point.discoveryScore >= targetValue;
                  
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={meetsGoal ? 'hsl(var(--topic-next-steps))' : 'hsl(var(--primary))'}
                      stroke="hsl(var(--card))"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
              
              {/* Labels */}
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                {progressHistory.map((point, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger className="cursor-default">
                      <span className={cn(
                        point.discoveryScore >= targetValue && 'text-topic-next-steps font-medium'
                      )}>
                        {point.callDate}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Score: {point.discoveryScore}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            
            {/* Verdict */}
            <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              {status === 'improving' && <TrendingUp className="h-4 w-4 text-topic-next-steps flex-shrink-0 mt-0.5" />}
              {status === 'regressing' && <CheckCircle2 className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />}
              <p>{verdictText}</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
