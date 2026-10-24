import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { bytesToMB, formatDate } from "../../lib/formatters";
import type { Document } from "../../types/document.types";
import { 
    Folder, 
    FolderInput,
    HardDrive, 
    User, 
    Calendar, 
    FileText, 
    FileSpreadsheet, 
    FileCode, 
    FileArchive, 
    File as GenericFileIcon,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Clock
} from "lucide-react";

export function getFileIcon(filename: string, mimeType?: string) {
    const ext = filename?.split(".").pop()?.toLowerCase() || "";
    if (["pdf", "txt", "md", "doc", "docx", "rtf"].includes(ext) || mimeType?.includes("pdf") || mimeType?.includes("text")) {
        return <FileText className="size-5 text-blue-500 shrink-0" />;
    }
    if (["csv", "xlsx", "xls", "tsv"].includes(ext) || mimeType?.includes("sheet") || mimeType?.includes("csv")) {
        return <FileSpreadsheet className="size-5 text-emerald-500 shrink-0" />;
    }
    if (["js", "ts", "tsx", "jsx", "py", "html", "css", "json", "yaml", "yml"].includes(ext) || mimeType?.includes("json")) {
        return <FileCode className="size-5 text-amber-500 shrink-0" />;
    }
    if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) {
        return <FileArchive className="size-5 text-purple-500 shrink-0" />;
    }
    return <GenericFileIcon className="size-5 text-muted-foreground shrink-0" />;
}

function renderStatusBadge(status?: string, isActive?: boolean) {
    const normalized = status?.toLowerCase().trim() || (isActive ? "ready" : "uploaded");

    switch (normalized) {
        case "ready":
        case "active":
        case "indexed":
        case "completed":
            return (
                <Badge variant="success" className="gap-1 px-2 py-0.5 font-medium">
                    <CheckCircle2 className="size-3 shrink-0" />
                    <span>Ready</span>
                </Badge>
            );
        case "error":
        case "failed":
            return (
                <Badge variant="destructive" className="gap-1 px-2 py-0.5 font-medium">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>Error</span>
                </Badge>
            );
        case "processing":
        case "indexing":
            return (
                <Badge variant="warning" className="gap-1 px-2 py-0.5 font-medium">
                    <RefreshCw className="size-3 shrink-0 animate-spin" />
                    <span>Processing</span>
                </Badge>
            );
        case "uploaded":
            return (
                <Badge variant="info" className="gap-1 px-2 py-0.5 font-medium">
                    <Clock className="size-3 shrink-0" />
                    <span>Uploaded</span>
                </Badge>
            );
        case "pending":
        case "queued":
            return (
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 font-medium">
                    <Clock className="size-3 shrink-0" />
                    <span>Pending</span>
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 font-medium capitalize">
                    <span>{normalized}</span>
                </Badge>
            );
    }
}

interface DocCardProps {
    document: Document;
    onClick?: (document: Document) => void;
    onMove?: (document: Document) => void;
}

export default function DocCard({ document: doc, onClick, onMove }: DocCardProps) {
    return (
        <Card 
            onClick={() => onClick?.(doc)}
            className="group flex flex-col justify-between h-full overflow-hidden border-border/80 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 bg-card hover:cursor-pointer"
        >
            <CardHeader className="p-4 pb-2 space-y-2.5 min-w-0">
                {/* Top header row: icon + distinct status badge for every status */}
                <div className="flex items-center justify-between gap-2 min-w-0 w-full h-8">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/80 ring-1 ring-border/50 group-hover:bg-primary/10 transition-colors">
                        {getFileIcon(doc.filename, doc.mime_type)}
                    </div>
                    {/* Consistent status badge */}
                    <div className="flex items-center shrink-0">
                        {renderStatusBadge(doc.status, doc.is_active)}
                    </div>
                </div>

                {/* Title & Filename: safe truncation with min-w-0 */}
                <div className="min-w-0 w-full space-y-0.5">
                    <CardTitle 
                        className="text-sm font-semibold text-foreground truncate block w-full group-hover:text-primary transition-colors leading-snug" 
                        title={doc.title || doc.filename}
                    >
                        {doc.title || doc.filename}
                    </CardTitle>
                    <p 
                        className="text-[11px] text-muted-foreground truncate font-mono block w-full" 
                        title={doc.filename}
                    >
                        {doc.filename}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-1 pb-3 space-y-2.5 text-xs min-w-0 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 min-w-0">
                    {/* Collection pill with quick Move action */}
                    <div className="flex items-center justify-between gap-1.5 text-muted-foreground min-w-0 w-full">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Folder className="size-3 text-purple-500 shrink-0" />
                            <span className="truncate text-[11px] font-medium text-foreground/80 min-w-0 block">
                                {doc.collection_name || "General knowledge"}
                            </span>
                        </div>
                        {onMove && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMove(doc);
                                }}
                                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/80 transition-colors shrink-0 font-medium"
                                title="Move to collection"
                            >
                                <FolderInput className="size-3" />
                                <span>Move</span>
                            </button>
                        )}
                    </div>

                    {/* Description if present */}
                    {doc.description && (
                        <p className="text-muted-foreground line-clamp-2 text-[11px] break-words" title={doc.description}>
                            {doc.description}
                        </p>
                    )}
                </div>

                {/* Meta details footer: strict min-w-0 and truncation */}
                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground min-w-0 mt-auto">
                    <div className="flex items-center gap-1 min-w-0">
                        <HardDrive className="size-3 shrink-0" />
                        <span className="truncate">{bytesToMB(doc.file_size)}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end min-w-0">
                        <User className="size-3 shrink-0" />
                        <span className="truncate">@{doc.uploader_name || "user"}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2 text-[10px] text-muted-foreground/80 min-w-0 pt-0.5">
                        <Calendar className="size-3 shrink-0" />
                        <span className="truncate">{formatDate(doc.updated_at || doc.created_at)}</span>
                        {doc.current_version > 1 && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 ml-auto shrink-0 font-normal">
                                v{doc.current_version}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
