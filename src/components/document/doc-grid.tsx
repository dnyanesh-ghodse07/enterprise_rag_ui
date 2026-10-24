import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import DocCard from "./doc-card";
import type { Document } from "../../types/document.types";
import { Files, PlusCircle } from "lucide-react";

interface DocGridProps {
    documents: Document[];
    isLoading?: boolean;
    hasActiveFilters?: boolean;
    onClearFilters?: () => void;
    onUploadClick?: () => void;
    onDocumentClick?: (doc: Document) => void;
    onMoveDocument?: (doc: Document) => void;
}

export default function DocGrid({
    documents,
    isLoading = false,
    hasActiveFilters = false,
    onClearFilters,
    onUploadClick,
    onDocumentClick,
    onMoveDocument,
}: DocGridProps) {
    if (isLoading && (!documents || documents.length === 0)) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="p-4 space-y-3 border-border/80">
                        <div className="flex items-start justify-between gap-2">
                            <Skeleton className="size-9 rounded-lg" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <div className="pt-2 border-t border-border/40 flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center py-12 px-4 text-center border-dashed">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                    <Files className="size-7" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                    {hasActiveFilters ? "No matching documents" : "No documents added yet"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
                    {hasActiveFilters
                        ? "Try adjusting your search query or collection/status filters to find what you need."
                        : "Upload PDF, DOCX, TXT, or markdown files to start grounding conversations with your documents."}
                </p>
                <div className="mt-4 flex gap-2">
                    {hasActiveFilters ? (
                        <Button variant="outline" size="sm" onClick={onClearFilters}>
                            Reset Filters
                        </Button>
                    ) : (
                        <Button size="sm" onClick={onUploadClick}>
                            <PlusCircle className="size-4 mr-1.5" />
                            Upload First Document
                        </Button>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 auto-rows-fr items-stretch">
            {documents.map((doc) => (
                <DocCard 
                    key={doc.id} 
                    document={doc} 
                    onClick={onDocumentClick}
                    onMove={onMoveDocument}
                />
            ))}
        </div>
    );
}
