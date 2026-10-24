import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { apiDelete } from "../../api/client";
import type { CollectionItem } from "../../types/collection.types";
import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteCollectionDialogProps {
    collection: CollectionItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (deletedId: string) => void;
}

export default function DeleteCollectionDialog({
    collection,
    isOpen,
    onClose,
    onSuccess,
}: DeleteCollectionDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !collection) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await apiDelete(`/collections/${collection.id}`);
            onSuccess(collection.id);
            onClose();
        } catch (err: any) {
            console.error("Error deleting collection", err);
            setError(err?.message || "Failed to delete collection.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150">
            <Card className="w-full max-w-sm bg-background border-border shadow-xl">
                <CardHeader className="p-4 pb-2 border-b border-border/60">
                    <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                        <AlertCircle className="size-5 shrink-0" />
                        Delete Collection
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Are you sure you want to delete this collection?
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-3.5">
                    {error && (
                        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-foreground/80 break-words leading-relaxed">
                        Collection <strong className="text-foreground">"{collection.name}"</strong> will be deleted.
                        {collection.document_count > 0 && (
                            <span className="block mt-1 text-muted-foreground">
                                Its <strong>{collection.document_count}</strong> {collection.document_count === 1 ? "document" : "documents"} will remain preserved in your knowledge base under general knowledge.
                            </span>
                        )}
                    </p>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Spinner className="size-3.5 mr-1.5" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-3.5 mr-1.5" />
                                    Delete Collection
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
