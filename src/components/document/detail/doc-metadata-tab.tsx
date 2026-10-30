import { Card, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";
import { bytesToMB, formatDate } from "../../../utils";
import type { Document, VectorStatusInfo } from "../../../types/document.types";
import { Database, Sparkles } from "lucide-react";

interface DocMetadataTabProps {
    doc: Document;
    chunksCount: number;
    vectorStatus?: VectorStatusInfo | null;
    isEmbedding?: boolean;
    onEmbed?: () => void;
}

export default function DocMetadataTab({
    doc,
    chunksCount,
    vectorStatus,
    isEmbedding = false,
    onEmbed,
}: DocMetadataTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-3.5 sm:p-5 border-border/80 bg-card">
                <CardTitle className="text-xs sm:text-sm font-semibold mb-2.5 sm:mb-3">General Information</CardTitle>
                <div className="divide-y divide-border/40 text-xs">
                    <div className="py-2 flex items-center justify-between gap-2 min-w-0">
                        <span className="text-muted-foreground shrink-0">Document ID</span>
                        <span className="font-mono text-[10px] sm:text-[11px] select-all truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">{doc.id}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2 min-w-0">
                        <span className="text-muted-foreground shrink-0">Tenant ID</span>
                        <span className="font-mono text-[10px] sm:text-[11px] select-all truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">{doc.tenant_id}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2 min-w-0">
                        <span className="text-muted-foreground shrink-0">MIME Type</span>
                        <span className="font-mono text-[11px] truncate max-w-[160px] sm:max-w-none">{doc.mime_type}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">File Size</span>
                        <span>{bytesToMB(doc.file_size)}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Current Version</span>
                        <Badge variant="outline" className="text-[10px]">v{doc.current_version}</Badge>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Status</span>
                        <span className="capitalize font-medium">{doc.status}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Active</span>
                        <span>{doc.is_active ? "Yes" : "No"}</span>
                    </div>
                </div>
            </Card>

            <Card className="p-3.5 sm:p-5 border-border/80 bg-card">
                <CardTitle className="text-xs sm:text-sm font-semibold mb-2.5 sm:mb-3">Ownership & Timestamps</CardTitle>
                <div className="divide-y divide-border/40 text-xs">
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Uploaded By</span>
                        <span className="font-medium">@{doc.uploader_name}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2 min-w-0">
                        <span className="text-muted-foreground shrink-0">Uploader User ID</span>
                        <span className="font-mono text-[10px] sm:text-[11px] select-all truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">{doc.uploaded_by}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Collection</span>
                        <span className="truncate max-w-[160px] sm:max-w-none">{doc.collection_name || "General knowledge"}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Created At</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Chunks Count</span>
                        <span>{chunksCount} chunks</span>
                    </div>
                </div>
            </Card>

            {/* Vector Store & Embedding Information */}
            <Card className="p-3.5 sm:p-5 border-border/80 bg-card md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <Database className="size-4 text-emerald-500 shrink-0" />
                        <CardTitle className="text-xs sm:text-sm font-semibold">Vector Store & Embedding Index</CardTitle>
                    </div>
                    {onEmbed && (
                        <Button
                            size="sm"
                            variant={vectorStatus?.isEmbedded ? "outline" : "default"}
                            onClick={onEmbed}
                            disabled={isEmbedding}
                            className="text-xs h-8 w-full sm:w-auto justify-center"
                        >
                            {isEmbedding ? (
                                <>
                                    <Spinner className="size-3 mr-1.5" />
                                    Vectorizing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-3 mr-1.5 text-emerald-500" />
                                    {vectorStatus?.isEmbedded ? "Re-index Vectors" : "Embed in Vector Store"}
                                </>
                            )}
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-[11px] text-muted-foreground block mb-1">Vector Database</span>
                        <span className="text-xs font-semibold">Qdrant</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-[11px] text-muted-foreground block mb-1">Target Collection</span>
                        <span className="text-xs font-mono font-medium">cognix_documents</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-[11px] text-muted-foreground block mb-1">Embedding Dimensions</span>
                        <span className="text-xs font-semibold">1,536 (text-embedding-3-small)</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-[11px] text-muted-foreground block mb-1">Vector Indexing Status</span>
                        {vectorStatus?.isEmbedded ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Vectorized ({vectorStatus.chunksEmbedded || chunksCount} vectors)</span>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">Not Vectorized</span>
                        )}
                    </div>
                </div>
                {vectorStatus?.embeddedAt && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                        Last vectorized on: {formatDate(vectorStatus.embeddedAt)}
                    </p>
                )}
            </Card>
        </div>
    );
}
