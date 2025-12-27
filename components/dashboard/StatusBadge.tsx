import { Badge } from '@/components/ui/badge';
import type { Recording } from '@/data/mockData';

interface StatusBadgeProps {
  status: Recording['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const labels: Record<Recording['status'], string> = {
    processing: 'Processing',
    completed: 'Completed',
    error: 'Error',
  };

  return <Badge variant={status}>{labels[status]}</Badge>;
}
