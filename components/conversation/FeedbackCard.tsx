import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { FeedbackItem } from '@/data/mockData';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface FeedbackCardProps {
  summary: string;
  improvements: FeedbackItem[];
}

export function FeedbackCard({ summary, improvements }: FeedbackCardProps) {
  return (
    <div className="card-elevated h-full flex flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">AI Feedback</h2>
      </div>
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Executive Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-10">
              {summary}
            </p>
          </div>

          {/* Key Improvements */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-completed">
                <Lightbulb className="h-4 w-4 text-status-completed-text" />
              </div>
              <h3 className="font-semibold text-foreground">Key Improvements</h3>
            </div>
            <div className="space-y-3 pl-10">
              {improvements.map((item, index) => (
                <div
                  key={index}
                  className="animate-slide-in rounded-lg bg-muted/50 p-4"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}
                >
                  <Badge variant="category" className="mb-2">
                    {item.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
