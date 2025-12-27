import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TranscriptLineBasic {
  speaker: string;
  text: string;
  timestamp: string;
}

interface TranscriptCardProps {
  transcript: TranscriptLineBasic[];
}

export function TranscriptCard({ transcript }: TranscriptCardProps) {
  return (
    <div className="card-elevated h-full flex flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Transcript</h2>
      </div>
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4">
          {transcript.map((line, index) => {
            const isMe = line.speaker === 'Me' || line.speaker === 'A';
            const speakerLabel = isMe ? 'Me' : 'Prospect';
            const speakerInitial = isMe ? 'M' : 'P';
            
            return (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium',
                      isMe
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {speakerInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {speakerLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {line.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {line.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
