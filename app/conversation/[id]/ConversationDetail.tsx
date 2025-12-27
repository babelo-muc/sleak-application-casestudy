"use client"
import { useState, useCallback } from 'react';
import { ArrowLeft, Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameTapePlayer } from '@/components/coaching/GameTapePlayer';
import { MetricsDashboard } from '@/components/coaching/MetricsDashboard';
import { InteractiveTranscript } from '@/components/coaching/InteractiveTranscript';
import { ContextualCoach } from '@/components/coaching/ContextualCoach';
import { GoalBanner } from '@/components/coaching/GoalBanner';
import { GoalTracker } from '@/components/coaching/GoalTracker';
import { mockCoachingSession } from '@/data/mockData';

export default function ConversationDetail() {
  const session = mockCoachingSession;

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCoachingMode, setIsCoachingMode] = useState(true);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">
            {session.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {session.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {session.duration}
            </span>
          </div>
        </div>
        
        {/* Coaching Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Coaching Mode</span>
          <button
            onClick={() => setIsCoachingMode(!isCoachingMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            {isCoachingMode ? (
              <ToggleRight className="h-5 w-5 text-primary" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={`text-sm font-medium ${isCoachingMode ? 'text-primary' : 'text-muted-foreground'}`}>
              {isCoachingMode ? 'On' : 'Off'}
            </span>
          </button>
        </div>
      </div>

      {/* Goal Banner */}
      <GoalBanner 
        goal="Reduce Monologues < 90s" 
        isCoachingMode={isCoachingMode} 
      />

      {/* Hero: Game Tape Player */}
      <GameTapePlayer
        audioUrl={session.audioUrl}
        durationSeconds={session.durationSeconds}
        segments={session.timelineSegments}
        pins={session.timelinePins}
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />

      {/* Metrics Dashboard */}
      <MetricsDashboard metrics={session.metrics} />

      {/* Split-View Study Hall */}
      <div className="grid gap-4 lg:grid-cols-[60%_40%]" style={{ minHeight: '480px' }}>
        <InteractiveTranscript
          transcript={session.transcript}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
        <ContextualCoach
          insights={session.insights}
          objections={session.objections}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>

      {/* Goal Tracker Footer */}
      <GoalTracker
        progressHistory={session.progressHistory}
        goal="Reduce Monologues < 90s"
        targetValue={75}
      />
    </div>
  );
}
