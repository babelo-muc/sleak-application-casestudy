'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Recording,
    deleteAllDeletedRecordings,
    mockDeletedRecordings,
    restoreRecordingFromDeleted,
} from '@/data/mockData'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DeletedPage() {
    const [deleted, setDeleted] = useState<Recording[]>([])
    const { toast } = useToast()

    useEffect(() => {
        setDeleted([...mockDeletedRecordings])
    }, [])

    const handleRestore = (id: string) => {
        const restored = restoreRecordingFromDeleted(id)
        if (restored) {
            setDeleted([...mockDeletedRecordings])
            toast({ title: 'Recording restored', description: `${restored.name} was restored to Conversations.` })
        }
    }

    const handleDeleteAll = () => {
        deleteAllDeletedRecordings()
        setDeleted([])
        toast({ title: 'Trash emptied', description: 'All deleted recordings were permanently removed.' })
    }

    return (
        <div className="animate-fade-in mx-auto max-w-7xl">
            <div className="card-elevated">
                <div className="border-border flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h1 className="text-foreground text-xl font-semibold">Deleted Recordings</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Restore or permanently remove deleted recordings.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/conversations">
                            <Button variant="ghost">Back to Conversations</Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDeleteAll}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Everything
                        </Button>
                    </div>
                </div>
                <div className="p-6">
                    {deleted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                                <Trash2 className="text-muted-foreground h-10 w-10" />
                            </div>
                            <h3 className="text-foreground mb-1 text-lg font-semibold">Trash is empty</h3>
                            <p className="text-muted-foreground max-w-sm text-center text-sm">
                                Deleted recordings will appear here. You can restore them back to Conversations.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border bg-muted/30 hover:bg-transparent">
                                    <TableHead>Recording Name</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead className="hidden md:table-cell">Call Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deleted.map((rec) => (
                                    <TableRow
                                        key={rec.id}
                                        className="border-border hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell className="text-foreground max-w-[200px] truncate font-medium">
                                            {rec.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{rec.duration}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {rec.owner.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-foreground hidden text-sm lg:inline">
                                                    {rec.owner.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-muted-foreground text-sm">{rec.callType}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(rec.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleRestore(rec.id)}>
                                                    <RotateCcw className="mr-2 h-4 w-4" />
                                                    Restore
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    )
}
