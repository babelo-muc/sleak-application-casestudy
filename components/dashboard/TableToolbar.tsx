import { Search, Calendar, Filter, Users, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (value: string) => void;
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  ownerFilter,
  onOwnerFilterChange,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recordings, clients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {dateFilter || 'Date Range'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => onDateFilterChange('')}>
              All Time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange('Today')}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange('Last 7 Days')}>
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange('Last 30 Days')}>
              Last 30 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange('Last 90 Days')}>
              Last 90 Days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {statusFilter || 'Status'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => onStatusFilterChange('')}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange('completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange('processing')}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange('error')}>
              Error
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Owner Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              {ownerFilter || 'Owner'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => onOwnerFilterChange('')}>
              All Owners
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOwnerFilterChange('Sarah Johnson')}>
              Sarah Johnson
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOwnerFilterChange('Mike Chen')}>
              Mike Chen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOwnerFilterChange('Emily Davis')}>
              Emily Davis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOwnerFilterChange('Alex Thompson')}>
              Alex Thompson
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOwnerFilterChange('Jordan Lee')}>
              Jordan Lee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
