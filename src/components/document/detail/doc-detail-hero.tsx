import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardHeader } from "../../ui/card";
import { Spinner } from "../../ui/spinner";
import { getFileIcon } from "../doc-card";
import { bytesToMB, formatDate } from "../../../utils";
import { 
    Download, 
    UploadCloud, 
    Trash2, 
    Folder, 
    HardDrive, 
    User, 
    Calendar, 
    Lock,
    FolderInput,
    Database,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Layers
} from "lucide-react";
import type { Document, VectorStatusInfo } from "../../../types/document.types";

interface DocDetailHeroProps {
    doc: Document;
    chunksCount?: number;
    isAdminOrOwner: boolean;
    isProcessing?: boolean;
    isDownloading?: boolean;
    isEmbedding?: boolean;
    vectorStatus?: VectorStatusInfo | null;
    onProcessAndEmbed: () => void;
    onDownload: () => void;
    onOpenUploadVersion: () => void;
    onOpenDeleteConfirm: () => void;
    onOpenMoveCollection?: () => void;
}

export default function DocDetailHero({
    doc,
    chunksCount = 0,
    isAdminOrOwner,
    isProcessing = false,
    isDownloading = false,
    isEmbedding = false,
    vectorStatus,
    onProcessAndEmbed,
    onDownload,
    onOpenUploadVersion,
    onOpenDeleteConfirm,
    onOpenMoveCollection,
}: DocDetailHeroProps) {
    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === "ready" || s === "processed") {
            return <Badge variant="success" className="text-xs capitalize">Ready</Badge>;
        }
        if (s === "processing") {
            return (
                <Badge variant="warning" className="text-xs capitalize flex items-center gap-1">
                    <Spinner className="size-3" />
                    Processing
                </Badge>
            );
        }
        if (s === "uploaded") {
            return <Badge variant="info" className="text-xs capitalize">Uploaded</Badge>;
        }
        if (s === "error" || s === "failed") {
            return <Badge variant="destructive" className="text-xs capitalize">Error</Badge>;
        }
        return <Badge variant="outline" className="text-xs capitalize">{status}</Badge>;
    };

    const getVectorBadge = () => {
        if (isEmbedding) {
            return (
                <Badge variant="warning" className="text-xs capitalize flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    <Spinner className="size-3" />
                    Vectorizing...
                </Badge>
            );
        }
        if (vectorStatus?.isEmbedded) {
            return (
                <Badge variant="success" className="text-xs capitalize flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <Database className="size-3" />
                    Vectorized {vectorStatus.chunksEmbedded > 0 ? `(${vectorStatus.chunksEmbedded})` : ""}
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1 border-dashed">
                <Database className="size-3 opacity-60" />
                Not Vectorized
            </Badge>
        );
    };

    const getProgressInfo = () => {
        if (isProcessing || isEmbedding) {
            return {
                percent: 70,
                stageLabel: "Processing & Vectorizing...",
                statusText: "Extracting semantic chunks and generating 1,536d vector embeddings in Qdrant",
                barColor: "bg-primary",
                icon: "spinner" as const,
            };
        }
        if (doc.status === "error" || doc.status === "failed") {
            return {
                percent: 100,
                stageLabel: "Error",
                statusText: "Processing error encountered. Check file format or retry vectorizing.",
                barColor: "bg-destructive",
                icon: "error" as const,
            };
        }
        if (vectorStatus?.isEmbedded) {
            const count = vectorStatus.chunksEmbedded || chunksCount || 0;
            return {
                percent: 100,
                stageLabel: "Stage 3 of 3 • 100% Vectorized",
                statusText: `Ready for AI Search • ${count} ${count === 1 ? "chunk" : "chunks"} indexed in Qdrant vector database ('cognix_documents')`,
                barColor: "bg-emerald-500",
                icon: "success" as const,
            };
        }
        if (doc.status === "ready" || chunksCount > 0) {
            return {
                percent: 66,
                stageLabel: "Stage 2 of 3 • 66%",
                statusText: `Chunks Extracted (${chunksCount} chunks) • Click 'Process & Vectorize' to store vectors`,
                barColor: "bg-amber-500",
                icon: "processed" as const,
            };
        }
        return {
            percent: 33,
            stageLabel: "Stage 1 of 3 • 33%",
            statusText: "Uploaded • Document stored, ready to process chunks & store in vector database",
            barColor: "bg-blue-500",
            icon: "uploaded" as const,
        };
    };

    const progressInfo = getProgressInfo();

    return (
        <Card className="border-border/80 shadow-xs overflow-hidden">
            {/* Header: Identity & Metadata */}
            <CardHeader className="p-5 sm:p-6 pb-4 sm:pb-5">
                <div className="flex items-start gap-4">
                    {/* Document Type Icon */}
                    <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-muted/60 border border-border/40 text-foreground shadow-xs">
                        {getFileIcon(doc.filename, doc.mime_type)}
                    </div>

                    {/* Title & Metadata Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 
                                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate max-w-2xl" 
                                title={doc.title || doc.filename}
                            >
                                {doc.title || doc.filename}
                            </h1>
                            <Badge variant="outline" className="text-xs font-mono px-2 py-0.5">
                                v{doc.current_version}
                            </Badge>
                            {getStatusBadge(doc.status)}
                            {getVectorBadge()}
                        </div>

                        {doc.title && doc.title !== doc.filename && (
                            <p className="text-xs font-mono text-muted-foreground truncate max-w-xl">
                                {doc.filename}
                            </p>
                        )}

                        {doc.description && (
                            <p className="text-xs text-muted-foreground/90 line-clamp-2 pt-0.5 max-w-3xl">
                                {doc.description}
                            </p>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1.5">
                            {doc.collection_name && (
                                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                                    <Folder className="size-3.5 text-purple-500" />
                                    <span>{doc.collection_name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <HardDrive className="size-3.5 text-muted-foreground/70" />
                                <span>{bytesToMB(doc.file_size)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="size-3.5 text-muted-foreground/70" />
                                <span>@{doc.uploader_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-muted-foreground/70" />
                                <span>{formatDate(doc.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Dedicated Action Bar Toolbar: Perfectly Aligned */}
            <div className="border-t border-border/50 bg-muted/10 px-5 sm:px-6 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Primary Action Button */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={vectorStatus?.isEmbedded ? "outline" : "default"}
                            size="sm"
                            onClick={onProcessAndEmbed}
                            disabled={isProcessing || isEmbedding}
                            className={`h-9 px-4 gap-2 text-xs sm:text-sm font-semibold shadow-xs ${
                                vectorStatus?.isEmbedded 
                                    ? "border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-primary text-primary-foreground"
                            }`}
                            title="Extract chunks, generate embeddings, and store vectors into Qdrant"
                        >
                            {isProcessing || isEmbedding ? (
                                <>
                                    <Spinner className="size-3.5" />
                                    <span>Processing & Vectorizing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-3.5 text-emerald-500" />
                                    <span>{vectorStatus?.isEmbedded ? "Re-vectorize Document" : "Process & Vectorize"}</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Secondary Management Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownload}
                            disabled={isDownloading}
                            className="h-9 px-3 gap-1.5 text-xs sm:text-sm"
                        >
                            {isDownloading ? (
                                <Spinner className="size-3.5" />
                            ) : (
                                <Download className="size-3.5 text-muted-foreground" />
                            )}
                            <span>Download</span>
                        </Button>

                        {onOpenMoveCollection && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onOpenMoveCollection}
                                className="h-9 px-3 gap-1.5 text-xs sm:text-sm"
                            >
                                <FolderInput className="size-3.5 text-purple-500" />
                                <span>Move</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenUploadVersion}
                            className="h-9 px-3 gap-1.5 text-xs sm:text-sm"
                        >
                            <UploadCloud className="size-3.5 text-blue-500" />
                            <span>New Version</span>
                        </Button>

                        {isAdminOrOwner ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onOpenDeleteConfirm}
                                className="h-9 px-3 gap-1.5 text-xs sm:text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                            >
                                <Trash2 className="size-3.5" />
                                <span>Delete</span>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                title="Administrator or document owner permission required to delete"
                                className="h-9 px-3 gap-1.5 text-xs sm:text-sm text-muted-foreground/60 cursor-not-allowed opacity-60"
                            >
                                <Lock className="size-3 text-muted-foreground" />
                                <span>Delete</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Current Status & Progress Bar Footer */}
            <div className="border-t border-border/60 bg-muted/25 px-5 sm:px-6 py-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            {progressInfo.icon === "spinner" && (
                                <Spinner className="size-3.5 text-primary shrink-0" />
                            )}
                            {progressInfo.icon === "success" && (
                                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            )}
                            {progressInfo.icon === "error" && (
                                <AlertCircle className="size-3.5 text-destructive shrink-0" />
                            )}
                            {progressInfo.icon === "processed" && (
                                <Layers className="size-3.5 text-amber-500 shrink-0" />
                            )}
                            {progressInfo.icon === "uploaded" && (
                                <UploadCloud className="size-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="font-medium text-foreground truncate">
                                {progressInfo.statusText}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono text-muted-foreground font-medium">
                                {progressInfo.stageLabel}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progressInfo.barColor} ${
                                isProcessing || isEmbedding ? "animate-pulse" : ""
                            }`}
                            style={{ width: `${progressInfo.percent}%` }}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
