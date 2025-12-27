import { useCallback, useState } from 'react'
import { FileAudio, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

interface UploadMeta {
    name: string
    duration: string
}

interface UploadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onUploadComplete: (meta: UploadMeta) => void
}

export function UploadModal({ open, onOpenChange, onUploadComplete }: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const dropped = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('audio/'))
        if (dropped.length) {
            setFiles((prev) => [...prev, ...dropped])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith('audio/'))
        if (selected.length) {
            setFiles((prev) => [...prev, ...selected])
        }
        // reset input value so same file can be picked again if removed
        e.currentTarget.value = ''
    }

    const handleUpload = async () => {
        if (!files.length) return

        setIsUploading(true)
        setProgress(0)

        // Upload each file sequentially, extracting duration from the file
        const getDuration = (file: File) =>
            new Promise<number>((resolve) => {
                const url = URL.createObjectURL(file)
                const audio = new Audio()
                audio.preload = 'metadata'
                audio.src = url
                const clean = () => {
                    URL.revokeObjectURL(url)
                }
                const onLoaded = () => {
                    const d = isFinite(audio.duration) ? audio.duration : 0
                    audio.removeEventListener('loadedmetadata', onLoaded)
                    clean()
                    resolve(d)
                }
                audio.addEventListener('loadedmetadata', onLoaded)
            })

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // simulate per-file upload progress steps
            const steps = 5
            for (let s = 1; s <= steps; s++) {
                await new Promise((r) => setTimeout(r, 150))
                const overall = Math.round(((i + s / steps) / files.length) * 100)
                setProgress(overall)
            }

            // get actual duration from file
            let durationSeconds = 0
            try {
                durationSeconds = await getDuration(file)
            } catch (e) {
                durationSeconds = 0
            }
            const mins = Math.floor(durationSeconds / 60)
            const secs = Math.round(durationSeconds % 60)
            const duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

            // notify parent with filename + duration
            onUploadComplete({ name: file.name, duration })
        }

        // finalize
        setProgress(100)
        setTimeout(() => {
            setIsUploading(false)
            setFiles([])
            setProgress(0)
            onOpenChange(false)
        }, 400)
    }

    const handleClose = () => {
        if (!isUploading) {
            setFiles([])
            setProgress(0)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Upload Recording</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {files.length === 0 ? (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault()
                                setIsDragging(true)
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                        >
                            <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                <Upload className="text-muted-foreground h-6 w-6" />
                            </div>
                            <p className="text-foreground mb-1 text-sm font-medium">
                                Drag & drop audio (MP3) or browse
                            </p>
                            <p className="text-muted-foreground text-xs">Supports MP3, WAV, M4A up to 100MB</p>
                            <input
                                type="file"
                                accept="audio/*"
                                multiple
                                onChange={handleFileSelect}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {files.map((f, idx) => (
                                    <div
                                        key={f.name + f.size + idx}
                                        className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
                                    >
                                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                            <FileAudio className="text-primary h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-foreground truncate text-sm font-medium">{f.name}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {(f.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        {!isUploading && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                                                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isUploading && (
                                <div className="space-y-2">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-muted-foreground text-center text-xs">
                                        Uploading... {progress}%
                                    </p>
                                </div>
                            )}

                            <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload {files.length > 1 ? `${files.length} Recordings` : 'Recording'}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
