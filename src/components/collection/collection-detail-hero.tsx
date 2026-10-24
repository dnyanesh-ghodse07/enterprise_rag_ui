import { Card, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "../../lib/formatters";
import type { CollectionItem } from "../../types/collection.types";
import { 
    Folder, 
    FileText, 
    Calendar, 
    Pencil, 
    Trash2, 
    PlusCircle, 
    X,
    CheckCircle2
} from "lucide-react";

interface CollectionDetailHeroProps {
    collection: CollectionItem;
    showUploadForm: boolean;
    onToggleUpload: () => void;
    onOpenEdit: () => void;
    onOpenDelete: () => void;
}

export default function CollectionDetailHero({
    collection,
    showUploadForm,
    onToggleUpload,
    onOpenEdit,
    onOpenDelete,
}: CollectionDetailHeroProps) {
    return (
        <Card className="border-border/80 shadow-xs overflow-hidden bg-card">
            <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Left: Icon and Details */}
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 shadow-xs">
                            <Folder className="size-6 sm:size-7" />
                        </div>

                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate max-w-xl">
                                    {collection.name}
                                </h1>
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <FileText className="size-3" />
                                    <span>
                                        {collection.document_count} {collection.document_count === 1 ? "document" : "documents"}
                                    </span>
                                </Badge>
                                {collection.is_active && (
                                    <Badge variant="success" className="gap-1 text-xs">
                                        <CheckCircle2 className="size-3" />
                                        <span>Active</span>
                                    </Badge>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words max-w-2xl">
                                {collection.description || (
                                    <span className="italic text-muted-foreground/60">
                                        No description provided. Click Edit to add details.
                                    </span>
                                )}
                            </p>

                            {/* Metadata row */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    <span>Created {formatDate(collection.created_at)}</span>
                                </div>
                                {collection.updated_at && collection.updated_at !== collection.created_at && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground/80">
                                        <span>Updated {formatDate(collection.updated_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 md:pt-0">
                        {/* Upload Doc to this Collection */}
                        <Button
                            size="sm"
                            onClick={onToggleUpload}
                            className="text-xs sm:text-sm font-medium"
                        >
                            {showUploadForm ? (
                                <>
                                    <X className="size-3.5 mr-1.5" />
                                    Close Upload
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="size-3.5 mr-1.5" />
                                    Upload Document
                                </>
                            )}
                        </Button>

                        {/* Edit Collection */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenEdit}
                            className="text-xs sm:text-sm"
                        >
                            <Pencil className="size-3.5 mr-1.5" />
                            Edit
                        </Button>

                        {/* Delete Collection */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenDelete}
                            className="text-xs sm:text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                        >
                            <Trash2 className="size-3.5 mr-1.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
