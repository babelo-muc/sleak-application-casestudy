'use client'
import { useCallback, useState } from 'react'
import { redirect } from 'next/navigation'
import { mockCoachingSession } from '@/data/mockData'
import { ArrowLeft, Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContextualCoach } from '@/components/coaching/ContextualCoach'
import { GameTapePlayer } from '@/components/coaching/GameTapePlayer'
import { GoalBanner } from '@/components/coaching/GoalBanner'
import { GoalTracker } from '@/components/coaching/GoalTracker'
import { InteractiveTranscript } from '@/components/coaching/InteractiveTranscript'
import { MetricsDashboard } from '@/components/coaching/MetricsDashboard'

export default function ConversationDetail() {
    const session = mockCoachingSession

    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isCoachingMode, setIsCoachingMode] = useState(true)

    const handleSeek = useCallback((time: number) => {
        setCurrentTime(time)
    }, [])

    const handlePlayPause = useCallback(() => {
        setIsPlaying((prev) => !prev)
    }, [])

    return (
        <div className="animate-fade-in mx-auto max-w-7xl space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redirect('/')}
                        className="text-muted-foreground hover:text-foreground mb-2 -ml-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-foreground text-2xl font-semibold">{session.title}</h1>
                    <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
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
                    <span className="text-muted-foreground text-sm">Coaching Mode</span>
                    <button
                        onClick={() => setIsCoachingMode(!isCoachingMode)}
                        className="bg-muted/50 hover:bg-muted flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors"
                    >
                        {isCoachingMode ? (
                            <ToggleRight className="text-primary h-5 w-5" />
                        ) : (
                            <ToggleLeft className="text-muted-foreground h-5 w-5" />
                        )}
                        <span
                            className={`text-sm font-medium ${isCoachingMode ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            {isCoachingMode ? 'On' : 'Off'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Goal Banner */}
            <GoalBanner goal="Reduce Monologues < 90s" isCoachingMode={isCoachingMode} />

            {/* Hero: Game Tape Player */}
            <GameTapePlayer
                audioUrl={session.audioUrl}
                durationSeconds={session.durationSeconds}
                segments={session.timelineSegments}
                transcript={session.transcript}
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
                <InteractiveTranscript transcript={session.transcript} currentTime={currentTime} onSeek={handleSeek} />
                <ContextualCoach
                    insights={session.insights}
                    objections={session.objections}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                />
            </div>

            {/* Goal Tracker Footer */}
            <GoalTracker progressHistory={session.progressHistory} goal="Reduce Monologues < 90s" targetValue={75} />
        </div>
    )
}
