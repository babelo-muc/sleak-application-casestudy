import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { redirect } from 'next/navigation'
import { Recording } from '@/data/mockData'
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, FileAudio, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusBadge } from './StatusBadge'
import { TablePagination } from './TablePagination'
import { TableToolbar } from './TableToolbar'

interface RecordingsTableProps {
    recordings: Recording[]
    onDelete: (id: string) => void
}

type SortField = 'name' | 'duration' | 'owner' | 'date' | 'status'
type SortDirection = 'asc' | 'desc' | null

export function RecordingsTable({ recordings, onDelete }: RecordingsTableProps) {
    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [ownerFilter, setOwnerFilter] = useState('')

    // Sort state
    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)

    // Filter logic
    const filteredRecordings = useMemo(() => {
        return recordings.filter((recording) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    recording.name.toLowerCase().includes(query) ||
                    recording.owner.name.toLowerCase().includes(query) ||
                    recording.callType.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            // Status filter
            if (statusFilter && recording.status !== statusFilter) return false

            // Owner filter
            if (ownerFilter && recording.owner.name !== ownerFilter) return false

            // Date filter
            if (dateFilter) {
                const recordingDate = new Date(recording.date)
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                switch (dateFilter) {
                    case 'Today':
                        if (recordingDate.toDateString() !== today.toDateString()) return false
                        break
                    case 'Last 7 Days':
                        const weekAgo = new Date(today)
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        if (recordingDate < weekAgo) return false
                        break
                    case 'Last 30 Days':
                        const monthAgo = new Date(today)
                        monthAgo.setDate(monthAgo.getDate() - 30)
                        if (recordingDate < monthAgo) return false
                        break
                    case 'Last 90 Days':
                        const quarterAgo = new Date(today)
                        quarterAgo.setDate(quarterAgo.getDate() - 90)
                        if (recordingDate < quarterAgo) return false
                        break
                }
            }

            return true
        })
    }, [recordings, searchQuery, dateFilter, statusFilter, ownerFilter])

    // Sort logic
    const sortedRecordings = useMemo(() => {
        if (!sortField || !sortDirection) return filteredRecordings

        return [...filteredRecordings].sort((a, b) => {
            let comparison = 0

            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                case 'duration':
                    const [aMin, aSec] = a.duration.split(':').map(Number)
                    const [bMin, bSec] = b.duration.split(':').map(Number)
                    comparison = aMin * 60 + aSec - (bMin * 60 + bSec)
                    break
                case 'owner':
                    comparison = a.owner.name.localeCompare(b.owner.name)
                    break
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
                    break
                case 'status':
                    comparison = a.status.localeCompare(b.status)
                    break
            }

            return sortDirection === 'desc' ? -comparison : comparison
        })
    }, [filteredRecordings, sortField, sortDirection])

    // Paginated recordings
    const paginatedRecordings = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        return sortedRecordings.slice(startIndex, startIndex + rowsPerPage)
    }, [sortedRecordings, currentPage, rowsPerPage])

    // Reset page when filters change
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1)
    }

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value)
        setCurrentPage(1)
    }

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    const handleOwnerFilterChange = (value: string) => {
        setOwnerFilter(value)
        setCurrentPage(1)
    }

    const handleRowsPerPageChange = (rows: number) => {
        setRowsPerPage(rows)
        setCurrentPage(1)
    }

    // Sort handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortField(null)
                setSortDirection(null)
            }
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Selection handlers
    const isAllSelected = paginatedRecordings.length > 0 && paginatedRecordings.every((r) => selectedIds.has(r.id))

    const isSomeSelected = paginatedRecordings.some((r) => selectedIds.has(r.id)) && !isAllSelected

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected = new Set(selectedIds)
            paginatedRecordings.forEach((r) => newSelected.add(r.id))
            setSelectedIds(newSelected)
        } else {
            const newSelected = new Set(selectedIds)
            paginatedRecordings.forEach((r) => newSelected.delete(r.id))
            setSelectedIds(newSelected)
        }
    }

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds)
        if (checked) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }
        setSelectedIds(newSelected)
    }

    // Lasso selection state & refs
    const containerRef = useRef<HTMLDivElement | null>(null)
    const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map())
    const isSelectingRef = useRef(false)
    const startPointRef = useRef<{ x: number; y: number } | null>(null)
    const [selectionRect, setSelectionRect] = useState<null | { x: number; y: number; width: number; height: number }>(null)

    // Lasso selection: start, move, end

    const onPointerMoveRef = useRef<(ev: MouseEvent) => void>(() => {})
    const onPointerUpRef = useRef<(ev: MouseEvent) => void>(() => {})

    const onPointerMove = useCallback((ev: MouseEvent) => {
        if (!isSelectingRef.current) return
        const container = containerRef.current
        const start = startPointRef.current
        if (!container || !start) return
        const rect = container.getBoundingClientRect()
        const x = ev.clientX - rect.left
        const y = ev.clientY - rect.top
        const left = Math.min(start.x, x)
        const top = Math.min(start.y, y)
        const width = Math.abs(start.x - x)
        const height = Math.abs(start.y - y)
        const sel = { x: left, y: top, width, height }
        setSelectionRect(sel)

        const newlySelected: string[] = []
        rowRefs.current.forEach((rowEl, id) => {
            const r = rowEl.getBoundingClientRect()
            const cRect = container.getBoundingClientRect()
            const rowBounds = {
                left: r.left - cRect.left,
                top: r.top - cRect.top,
                right: r.right - cRect.left,
                bottom: r.bottom - cRect.top,
            }
            const intersects = !(rowBounds.left > sel.x + sel.width || rowBounds.right < sel.x || rowBounds.top > sel.y + sel.height || rowBounds.bottom < sel.y)
            if (intersects) newlySelected.push(id)
        })

        setSelectedIds((prev) => {
            if (ev.ctrlKey || ev.metaKey) {
                const copy = new Set(prev)
                newlySelected.forEach((id) => copy.add(id))
                return copy
            }
            return new Set(newlySelected)
        })
    }, [])

    const onPointerUp = useCallback((ev: MouseEvent) => {
        if (!isSelectingRef.current) return
        isSelectingRef.current = false
        startPointRef.current = null
        setSelectionRect(null)
        window.removeEventListener('mousemove', onPointerMoveRef.current)
        window.removeEventListener('mouseup', onPointerUpRef.current)
    }, [])

    useEffect(() => {
        onPointerMoveRef.current = onPointerMove
        onPointerUpRef.current = onPointerUp
    }, [onPointerMove, onPointerUp])

    const startSelection = (e: React.MouseEvent) => {
        // only left button
        if (e.button !== 0) return
        const target = e.target as HTMLElement
        // ignore clicks on inputs/buttons so normal interactions still work
        if (target.closest('input') || target.closest('button') || target.closest('a')) return

        const container = containerRef.current
        if (!container) return
        isSelectingRef.current = true
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        startPointRef.current = { x, y }
        setSelectionRect({ x, y, width: 0, height: 0 })
        window.addEventListener('mousemove', onPointerMoveRef.current)
        window.addEventListener('mouseup', onPointerUpRef.current)
    }

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', onPointerMoveRef.current)
            window.removeEventListener('mouseup', onPointerUpRef.current)
        }
    }, [])

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-1 h-3 w-3" />
        }
        if (sortDirection === 'asc') {
            return <ArrowUp className="ml-1 h-3 w-3" />
        }
        return <ArrowDown className="ml-1 h-3 w-3" />
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
    }

    if (recordings.length === 0) {
        return (
            <div className="animate-fade-in flex flex-col items-center justify-center py-16">
                <div className="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <FileAudio className="text-muted-foreground h-10 w-10" />
                </div>
                <h3 className="text-foreground mb-1 text-lg font-semibold">No recordings yet</h3>
                <p className="text-muted-foreground max-w-sm text-center text-sm">
                    Upload your first sales call recording to get AI-powered coaching insights.
                </p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-4">
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
            <div ref={containerRef} onMouseDown={startSelection} className="relative border-border overflow-x-auto rounded-lg border">
                {selectionRect && (
                    <div
                        style={{
                            position: 'absolute',
                            left: selectionRect.x,
                            top: selectionRect.y,
                            width: selectionRect.width,
                            height: selectionRect.height,
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.5)',
                            pointerEvents: 'none',
                            zIndex: 40,
                        }}
                    />
                )}
                <Table>
                    <TableHeader>
                        <TableRow className="border-border bg-muted/30 hover:bg-transparent">
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
                                    className="text-muted-foreground hover:text-foreground flex items-center font-medium transition-colors"
                                >
                                    Recording Name
                                    {getSortIcon('name')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('duration')}
                                    className="text-muted-foreground hover:text-foreground flex items-center font-medium transition-colors"
                                >
                                    Duration
                                    {getSortIcon('duration')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('owner')}
                                    className="text-muted-foreground hover:text-foreground flex items-center font-medium transition-colors"
                                >
                                    Owner
                                    {getSortIcon('owner')}
                                </button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">Call Type</TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('date')}
                                    className="text-muted-foreground hover:text-foreground flex items-center font-medium transition-colors"
                                >
                                    Date
                                    {getSortIcon('date')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('status')}
                                    className="text-muted-foreground hover:text-foreground flex items-center font-medium transition-colors"
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
                                ref={(el: HTMLTableRowElement | null) => {
                                    if (el) rowRefs.current.set(recording.id, el)
                                    else rowRefs.current.delete(recording.id)
                                }}
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
                                <TableCell className="text-foreground max-w-[200px] truncate font-medium">
                                    {recording.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{recording.duration}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {getInitials(recording.owner.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-foreground hidden text-sm lg:inline">
                                            {recording.owner.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <span className="text-muted-foreground text-sm">{recording.callType}</span>
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
                                                        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
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
                                                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
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
    )
}
