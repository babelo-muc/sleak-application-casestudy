import { Target } from 'lucide-react';

interface GoalBannerProps {
  goal: string;
  isCoachingMode: boolean;
}

export function GoalBanner({ goal, isCoachingMode }: GoalBannerProps) {
  if (!isCoachingMode) return null;
  
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
        <Target className="h-4 w-4 text-primary" />
      </div>
      <div>
        <span className="text-xs font-medium text-primary uppercase tracking-wide">Focus Goal</span>
        <p className="text-sm font-semibold text-foreground">{goal}</p>
      </div>
    </div>
  );
}
