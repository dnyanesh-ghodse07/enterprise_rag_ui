import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Spinner } from "../../ui/spinner";
import { useClipboard } from "../../../hooks/use-clipboard";
import type { Document, DocumentChunk, ProcessingStatus, VectorStatusInfo } from "../../../types/document.types";
import { Search, Clock, Copy, Check, X, Database, Sparkles } from "lucide-react";

interface DocChunksTabProps {
    doc: Document;
    chunks: DocumentChunk[];
    processingStatus: ProcessingStatus | null;
    isProcessing: boolean;
    isEmbedding?: boolean;
    vectorStatus?: VectorStatusInfo | null;
    onProcess: () => void;
    onEmbed?: () => void;
}

export default function DocChunksTab({
    doc,
    chunks,
    processingStatus,
    isProcessing,
    isEmbedding = false,
    vectorStatus,
    onProcess,
    onEmbed,
}: DocChunksTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { isCopied, copy } = useClipboard();

    const filteredChunks = chunks.filter((chunk) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            chunk.content.toLowerCase().includes(q) ||
            (chunk.section_heading && chunk.section_heading.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-4">
            {/* Header stats & search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        Semantic Knowledge Chunks
                        {chunks.length > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                                {chunks.length} chunks
                            </Badge>
                        )}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {chunks.length > 0 ? (
                            <>
                                Total {processingStatus?.total_tokens ?? 0} tokens extracted • Version {doc.current_version} index
                            </>
                        ) : (
                            "Extracted text segments indexed for vector retrieval"
                        )}
                    </p>
                </div>

                {chunks.length > 0 && (
                    <div className="relative w-full sm:w-64">
                        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Filter chunks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs w-full"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Vector status banner when chunks exist */}
            {chunks.length > 0 && (
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border text-xs transition-colors ${
                    vectorStatus?.isEmbedded
                        ? "bg-emerald-500/5 border-emerald-500/25 text-foreground"
                        : "bg-muted/40 border-border/80 text-foreground"
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            vectorStatus?.isEmbedded 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                : "bg-muted text-muted-foreground"
                        }`}>
                            <Database className="size-4" />
                        </div>
                        <div>
                            <div className="font-semibold flex items-center gap-2">
                                <span>{vectorStatus?.isEmbedded ? "Indexed in Qdrant Vector DB" : "Vector Embeddings Pending"}</span>
                                {vectorStatus?.isEmbedded ? (
                                    <Badge variant="success" className="text-[10px] py-0 px-1.5 h-4">
                                        Ready
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-dashed text-muted-foreground">
                                        Not Embedded
                                    </Badge>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {vectorStatus?.isEmbedded
                                    ? `${vectorStatus.chunksEmbedded || chunks.length} chunks converted to 1536d vectors (model: text-embedding-3-small) in collection 'cognix_documents'`
                                    : "Convert extracted chunks to semantic vectors to enable vector search in AI Chat"}
                            </p>
                        </div>
                    </div>
                    {onEmbed && (
                        <Button
                            size="sm"
                            variant={vectorStatus?.isEmbedded ? "outline" : "default"}
                            onClick={onEmbed}
                            disabled={isEmbedding || isProcessing}
                            className="text-xs shrink-0 self-start sm:self-center"
                        >
                            {isEmbedding ? (
                                <>
                                    <Spinner className="size-3 mr-1.5" />
                                    Vectorizing...
                                </>
                            ) : (
                                <>
                                    <Database className={`size-3 mr-1.5 ${vectorStatus?.isEmbedded ? "text-emerald-500" : ""}`} />
                                    {vectorStatus?.isEmbedded ? "Re-embed in Vector" : "Embed in Vector"}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {/* Unprocessed Empty State */}
            {chunks.length === 0 ? (
                <Card className="p-8 text-center border-dashed bg-muted/20">
                    <Clock className="size-10 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-sm font-semibold">Document Not Yet Processed</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                        This document is stored in the workspace but has not been parsed into semantic search chunks. 
                        Click below to extract knowledge chunks and store vector embeddings into Qdrant.
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Button size="sm" onClick={onEmbed || onProcess} disabled={isProcessing || isEmbedding}>
                            {isEmbedding || isProcessing ? (
                                <>
                                    <Spinner className="size-3.5 mr-1.5" />
                                    Processing & Vectorizing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-3.5 mr-1.5" />
                                    Process & Vectorize Document
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            ) : filteredChunks.length === 0 ? (
                <Card className="p-8 text-center border-border/80 bg-muted/10">
                    <Search className="size-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-sm font-semibold">No Chunks Match Filter</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-3">
                        No chunks found matching "{searchQuery}". Try searching with different keywords.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setSearchQuery("")} className="text-xs">
                        Clear Filter
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredChunks.map((chunk) => (
                        <Card 
                            key={chunk.id} 
                            className="p-4 border-border/80 hover:border-primary/40 transition-colors bg-card"
                        >
                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/40 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                                        Chunk #{chunk.chunk_index + 1}
                                    </Badge>
                                    {chunk.section_heading && (
                                        <Badge variant="secondary" className="text-[10px] truncate max-w-xs font-medium text-foreground">
                                            {chunk.section_heading}
                                        </Badge>
                                    )}
                                    {chunk.page_number && (
                                        <span className="text-[11px]">Page {chunk.page_number}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                        {chunk.token_count} tokens
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => copy(chunk.content, chunk.id)}
                                        title="Copy chunk text"
                                        className="h-6 w-6"
                                    >
                                        {isCopied(chunk.id) ? (
                                            <Check className="size-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-2.5 text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap break-words select-text">
                                {chunk.content}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
