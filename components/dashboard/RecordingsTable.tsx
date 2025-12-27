import { useState, useMemo } from 'react';
import { Eye, Trash2, FileAudio, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { Recording } from '@/data/mockData';
import { TableToolbar } from './TableToolbar';
import { TablePagination } from './TablePagination';
import { redirect } from 'next/navigation';

interface RecordingsTableProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
}

type SortField = 'name' | 'duration' | 'owner' | 'date' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export function RecordingsTable({ recordings, onDelete }: RecordingsTableProps) {
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  
  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Filter logic
  const filteredRecordings = useMemo(() => {
    return recordings.filter((recording) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          recording.name.toLowerCase().includes(query) ||
          recording.owner.name.toLowerCase().includes(query) ||
          recording.dealContext.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && recording.status !== statusFilter) return false;

      // Owner filter
      if (ownerFilter && recording.owner.name !== ownerFilter) return false;

      // Date filter
      if (dateFilter) {
        const recordingDate = new Date(recording.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'Today':
            if (recordingDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'Last 7 Days':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (recordingDate < weekAgo) return false;
            break;
          case 'Last 30 Days':
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);
            if (recordingDate < monthAgo) return false;
            break;
          case 'Last 90 Days':
            const quarterAgo = new Date(today);
            quarterAgo.setDate(quarterAgo.getDate() - 90);
            if (recordingDate < quarterAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [recordings, searchQuery, dateFilter, statusFilter, ownerFilter]);

  // Sort logic
  const sortedRecordings = useMemo(() => {
    if (!sortField || !sortDirection) return filteredRecordings;

    return [...filteredRecordings].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'duration':
          const [aMin, aSec] = a.duration.split(':').map(Number);
          const [bMin, bSec] = b.duration.split(':').map(Number);
          comparison = (aMin * 60 + aSec) - (bMin * 60 + bSec);
          break;
        case 'owner':
          comparison = a.owner.name.localeCompare(b.owner.name);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredRecordings, sortField, sortDirection]);

  // Paginated recordings
  const paginatedRecordings = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedRecordings.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRecordings, currentPage, rowsPerPage]);

  // Reset page when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleOwnerFilterChange = (value: string) => {
    setOwnerFilter(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection handlers
  const isAllSelected = paginatedRecordings.length > 0 && 
    paginatedRecordings.every((r) => selectedIds.has(r.id));
  
  const isSomeSelected = paginatedRecordings.some((r) => selectedIds.has(r.id)) && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedIds);
      paginatedRecordings.forEach((r) => newSelected.add(r.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      paginatedRecordings.forEach((r) => newSelected.delete(r.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-1 h-3 w-3" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <FileAudio className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No recordings yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Upload your first sales call recording to get AI-powered coaching insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={handleOwnerFilterChange}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border bg-muted/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={isSomeSelected ? 'data-[state=checked]:bg-primary' : ''}
                />
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Recording Name
                  {getSortIcon('name')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Duration
                  {getSortIcon('duration')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('owner')}
                  className="flex items-center text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Owner
                  {getSortIcon('owner')}
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Deal Context
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Date
                  {getSortIcon('date')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecordings.map((recording, index) => (
              <TableRow
                key={recording.id}
                className="border-border hover:bg-muted/50 transition-colors"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(recording.id)}
                    onCheckedChange={(checked) => handleSelectOne(recording.id, !!checked)}
                    aria-label={`Select ${recording.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                  {recording.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {recording.duration}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(recording.owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground hidden lg:inline">
                      {recording.owner.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {recording.dealContext}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(recording.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <StatusBadge status={recording.status} />
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => redirect(`/conversation/${recording.id}`)}
                            disabled={recording.status !== 'completed'}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Recording Details</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(recording.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Move to Trash</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalItems={sortedRecordings.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
}
