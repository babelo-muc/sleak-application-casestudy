"use client"
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingsTable } from '@/components/dashboard/RecordingsTable';
import { UploadModal } from '@/components/dashboard/UploadModal';
import { mockRecordings, type Recording } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function ConversationDashboard() {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    toast({
      title: 'Recording moved to trash',
      description: 'The recording has been moved to your trash folder.',
    });
  };

  const handleUploadComplete = () => {
    const newRecording: Recording = {
      id: Date.now().toString(),
      name: 'New Recording - ' + new Date().toLocaleDateString(),
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      duration: '00:00',
      owner: { id: '1', name: 'Sarah Johnson' },
      dealContext: 'New Lead',
    };
    setRecordings((prev) => [newRecording, ...prev]);
    toast({
      title: 'Upload successful',
      description: 'Your recording is now being processed.',
    });
  };

  return (
    <>
      <div className="mx-auto max-w-7xl animate-fade-in">
        <div className="card-elevated">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Your Conversations</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
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

      <UploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
