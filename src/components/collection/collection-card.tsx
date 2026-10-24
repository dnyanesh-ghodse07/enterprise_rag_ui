import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "../../lib/formatters";
import type { CollectionItem } from "../../types/collection.types";
import { Folder, FileText, Calendar, Pencil, Trash2, ArrowRight } from "lucide-react";

interface CollectionCardProps {
    collection: CollectionItem;
    onClick: (collection: CollectionItem) => void;
    onEdit?: (collection: CollectionItem) => void;
    onDelete?: (collection: CollectionItem) => void;
}

export default function CollectionCard({
    collection,
    onClick,
    onEdit,
    onDelete,
}: CollectionCardProps) {
    return (
        <Card
            onClick={() => onClick(collection)}
            className="group flex flex-col justify-between h-full overflow-hidden border-border/80 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 bg-card hover:cursor-pointer"
        >
            <CardHeader className="p-4 pb-2 space-y-2.5 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0 w-full h-8">
                    {/* Collection Folder Icon */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                        <Folder className="size-5" />
                    </div>

                    {/* Document count badge */}
                    <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs font-medium">
                        <FileText className="size-3 shrink-0" />
                        <span>
                            {collection.document_count} {collection.document_count === 1 ? "doc" : "docs"}
                        </span>
                    </Badge>
                </div>

                {/* Collection Name */}
                <div className="min-w-0 w-full space-y-0.5">
                    <CardTitle
                        className="text-sm font-semibold text-foreground truncate block w-full group-hover:text-primary transition-colors leading-snug"
                        title={collection.name}
                    >
                        {collection.name}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-1 pb-3 space-y-2.5 text-xs min-w-0 flex-1 flex flex-col justify-between">
                {/* Description or fallback */}
                <div className="min-w-0">
                    <p
                        className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed break-words"
                        title={collection.description || "No description provided"}
                    >
                        {collection.description || (
                            <span className="italic text-muted-foreground/60">No description provided</span>
                        )}
                    </p>
                </div>

                {/* Footer metadata and quick actions */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground min-w-0 mt-auto">
                    <div className="flex items-center gap-1 min-w-0 text-[10px] text-muted-foreground/80">
                        <Calendar className="size-3 shrink-0" />
                        <span className="truncate">
                            {formatDate(collection.updated_at || collection.created_at)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(collection)}
                                className="size-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit collection"
                                aria-label="Edit collection"
                            >
                                <Pencil className="size-3.5" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(collection)}
                                className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete collection"
                                aria-label="Delete collection"
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onClick(collection)}
                            className="size-7 p-0 text-muted-foreground hover:text-primary"
                            title="Open collection"
                            aria-label="Open collection"
                        >
                            <ArrowRight className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
