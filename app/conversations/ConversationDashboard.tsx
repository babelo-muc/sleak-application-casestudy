'use client'
import { useState } from 'react'
import { type Recording, mockRecordings } from '@/data/mockData'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { RecordingsTable } from '@/components/dashboard/RecordingsTable'
import { UploadModal } from '@/components/dashboard/UploadModal'

export default function ConversationDashboard() {
    const [recordings, setRecordings] = useState<Recording[]>(mockRecordings)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const { toast } = useToast()

    const handleDelete = (id: string) => {
        setRecordings((prev) => prev.filter((r) => r.id !== id))
        toast({
            title: 'Recording moved to trash',
            description: 'The recording has been moved to your trash folder.',
        })
    }

    const handleUploadComplete = (meta?: { name: string; duration: string }) => {
        const newRecording: Recording = {
            id: Date.now().toString(),
            name: meta?.name ?? 'New Recording - ' + new Date().toLocaleDateString(),
            date: new Date().toISOString().split('T')[0],
            status: 'processing',
            duration: meta?.duration ?? '00:00',
            owner: { id: '1', name: 'Sarah Johnson' },
            callType: 'Outbound',
        }
        setRecordings((prev) => [newRecording, ...prev])
        toast({
            title: 'Upload successful',
            description: `${newRecording.name} is now being processed.`,
        })
    }

    return (
        <>
            <div className="animate-fade-in mx-auto max-w-7xl">
                <div className="card-elevated">
                    <div className="border-border flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h1 className="text-foreground text-xl font-semibold">Your Conversations</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Manage and review your sales call recordings
                            </p>
                        </div>
                        <Button onClick={() => setIsUploadOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Recordings
                        </Button>
                    </div>
                    <div className="p-6">
                        <RecordingsTable recordings={recordings} onDelete={handleDelete} />
                    </div>
                </div>
            </div>

            <UploadModal open={isUploadOpen} onOpenChange={setIsUploadOpen} onUploadComplete={handleUploadComplete} />
        </>
    )
}
