import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { Spinner } from "../../ui/spinner";
import { Markdown } from "../../ui/markdown";
import { getFileIcon } from "../doc-card";
import { bytesToMB } from "../../../utils";
import { useClipboard } from "../../../hooks/use-clipboard";
import type { Document } from "../../../types/document.types";
import { Download, Copy, Check } from "lucide-react";

interface DocPreviewTabProps {
    doc: Document;
    previewContent: string | null;
    previewBlobUrl: string | null;
    previewLoading: boolean;
    isDownloading: boolean;
    onDownload: () => void;
}

export default function DocPreviewTab({
    doc,
    previewContent,
    previewBlobUrl,
    previewLoading,
    isDownloading,
    onDownload,
}: DocPreviewTabProps) {
    const [previewMode, setPreviewMode] = useState<"formatted" | "raw">("formatted");
    const { isCopied, copy } = useClipboard();

    const isMarkdown = doc.filename.endsWith(".md") || doc.mime_type?.includes("markdown");
    const isPdf = doc.mime_type?.includes("pdf") || doc.filename.endsWith(".pdf");
    const isImage = doc.mime_type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(doc.filename);

    const handleCopy = () => {
        if (previewContent) {
            copy(previewContent, "preview-text");
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-border/80 overflow-hidden bg-card">
                <CardHeader className="p-3 sm:p-4 pb-3 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0">
                            {getFileIcon(doc.filename, doc.mime_type)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xs sm:text-sm font-semibold truncate">
                                    {doc.filename}
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                                    v{doc.current_version}
                                </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {doc.mime_type} • {bytesToMB(doc.file_size)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                        {/* Markdown Formatted / Raw switcher */}
                        {isMarkdown && previewContent && (
                            <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border/60">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("formatted")}
                                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                        previewMode === "formatted"
                                            ? "bg-background text-foreground font-medium shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Formatted
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("raw")}
                                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                        previewMode === "raw"
                                            ? "bg-background text-foreground font-medium shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Raw
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                            {/* Copy Content Button */}
                            {previewContent && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-7 text-xs px-2 sm:px-2.5"
                                >
                                    {isCopied("preview-text") ? (
                                        <>
                                            <Check className="size-3 mr-1 text-emerald-500" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3 mr-1" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Download File Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="h-7 text-xs px-2 sm:px-2.5"
                            >
                                <Download className="size-3 mr-1" />
                                Download
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-2 sm:p-5">
                    {previewLoading ? (
                        <div className="space-y-3 py-8">
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                                <Spinner className="size-4" />
                                <span>Loading document preview...</span>
                            </div>
                            <Skeleton className="h-4 w-3/4 mx-auto" />
                            <Skeleton className="h-4 w-5/6 mx-auto" />
                            <Skeleton className="h-4 w-2/3 mx-auto" />
                            <Skeleton className="h-32 w-full mt-4" />
                        </div>
                    ) : previewContent ? (
                        previewMode === "formatted" && isMarkdown ? (
                            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed p-1.5 sm:p-2">
                                <Markdown content={previewContent} />
                            </div>
                        ) : (
                            <pre className="text-xs font-mono bg-muted/40 p-2.5 sm:p-4 rounded-lg overflow-x-auto max-h-[420px] sm:max-h-[600px] whitespace-pre-wrap break-words text-foreground/90 leading-relaxed border border-border/40">
                                {previewContent}
                            </pre>
                        )
                    ) : previewBlobUrl && isPdf ? (
                        <iframe
                            src={previewBlobUrl}
                            title="PDF Document Preview"
                            className="w-full h-[400px] sm:h-[650px] rounded-lg border border-border/80"
                        />
                    ) : previewBlobUrl && isImage ? (
                        <div className="flex justify-center p-2 sm:p-4 bg-muted/20 rounded-lg">
                            <img
                                src={previewBlobUrl}
                                alt={doc.filename}
                                className="max-h-[350px] sm:max-h-[600px] max-w-full rounded-md object-contain shadow-xs"
                            />
                        </div>
                    ) : (
                        <div className="py-12 text-center space-y-3">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground">
                                {getFileIcon(doc.filename, doc.mime_type)}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold">Preview Not Available for This Format</h3>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    This file format ({doc.mime_type || "binary"}) cannot be previewed directly in the browser.
                                    You can download the full file to view it on your local system.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="mt-2 text-xs"
                            >
                                <Download className="size-3.5 mr-1.5" />
                                Download {doc.filename}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
