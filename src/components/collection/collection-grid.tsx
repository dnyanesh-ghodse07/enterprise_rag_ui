import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import CollectionCard from "./collection-card";
import type { CollectionItem } from "../../types/collection.types";
import { Folder, FolderPlus, SearchX } from "lucide-react";

interface CollectionGridProps {
    collections: CollectionItem[];
    isLoading: boolean;
    hasActiveFilters?: boolean;
    onClearFilters?: () => void;
    onCreateClick?: () => void;
    onCollectionClick: (collection: CollectionItem) => void;
    onEditCollection?: (collection: CollectionItem) => void;
    onDeleteCollection?: (collection: CollectionItem) => void;
}

export default function CollectionGrid({
    collections,
    isLoading,
    hasActiveFilters = false,
    onClearFilters,
    onCreateClick,
    onCollectionClick,
    onEditCollection,
    onDeleteCollection,
}: CollectionGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4 space-y-3 border-border/80">
                        <div className="flex items-center justify-between">
                            <Skeleton className="size-9 rounded-lg" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-full rounded" />
                        <div className="pt-2 border-t border-border/40 flex justify-between">
                            <Skeleton className="h-3 w-20 rounded" />
                            <Skeleton className="h-5 w-12 rounded" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (collections.length === 0) {
        if (hasActiveFilters) {
            return (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border/80 bg-card/40">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
                        <SearchX className="size-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No matching collections found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        No collections matched your search keyword. Try clearing your search query.
                    </p>
                    {onClearFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="mt-4 text-xs"
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-xl border border-dashed border-border/80 bg-card/40">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-3.5 ring-1 ring-purple-500/20">
                    <Folder className="size-7" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No collections yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Collections allow you to group related documents and focus AI answers on specific contexts.
                </p>
                {onCreateClick && (
                    <Button
                        size="sm"
                        onClick={onCreateClick}
                        className="mt-4 font-medium text-xs sm:text-sm"
                    >
                        <FolderPlus className="size-4 mr-1.5" />
                        Create Collection
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {collections.map((col) => (
                <CollectionCard
                    key={col.id}
                    collection={col}
                    onClick={onCollectionClick}
                    onEdit={onEditCollection}
                    onDelete={onDeleteCollection}
                />
            ))}
        </div>
    );
}
