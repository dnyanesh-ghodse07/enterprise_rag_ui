import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { apiPatch } from "../../api/client";
import type { CollectionItem, CollectionUpdatePayload } from "../../types/collection.types";
import { Pencil, AlertCircle } from "lucide-react";

interface EditCollectionDialogProps {
    collection: CollectionItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedCollection: CollectionItem) => void;
}

export default function EditCollectionDialog({
    collection,
    isOpen,
    onClose,
    onSuccess,
}: EditCollectionDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (collection && isOpen) {
            setName(collection.name || "");
            setDescription(collection.description || "");
            setError(null);
        }
    }, [collection, isOpen]);

    if (!isOpen || !collection) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Collection name cannot be empty.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const payload: CollectionUpdatePayload = {
                name: trimmedName,
                description: description.trim() || null,
            };

            const updated = await apiPatch<CollectionItem>(`/collections/${collection.id}`, payload);
            onSuccess(updated);
            onClose();
        } catch (err: any) {
            console.error("Error updating collection", err);
            setError(err?.message || "Failed to update collection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150">
            <Card className="w-full max-w-md bg-background border-border shadow-xl">
                <CardHeader className="p-4 pb-3 border-b border-border/60">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Pencil className="size-4" />
                        </div>
                        Edit Collection
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Update the name or description of this collection.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-collection-name" className="text-xs font-medium">
                                Collection Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-collection-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Collection name"
                                maxLength={255}
                                autoFocus
                                className="h-9 text-xs sm:text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-collection-desc" className="text-xs font-medium">
                                Description <span className="text-muted-foreground text-[11px] font-normal">(Optional)</span>
                            </Label>
                            <textarea
                                id="edit-collection-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a description..."
                                rows={3}
                                maxLength={2000}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="size-3.5 mr-1.5" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
