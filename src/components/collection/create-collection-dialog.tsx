import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { apiPost } from "../../api/client";
import type { CollectionItem, CollectionCreatePayload } from "../../types/collection.types";
import { FolderPlus, AlertCircle } from "lucide-react";

interface CreateCollectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCollection: CollectionItem) => void;
}

export default function CreateCollectionDialog({
    isOpen,
    onClose,
    onSuccess,
}: CreateCollectionDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Collection name is required.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const payload: CollectionCreatePayload = {
                name: trimmedName,
                description: description.trim() || null,
            };

            const created = await apiPost<CollectionItem>("/collections", payload);
            setName("");
            setDescription("");
            onSuccess(created);
            onClose();
        } catch (err: any) {
            console.error("Error creating collection", err);
            setError(err?.message || "Failed to create collection.");
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
                            <FolderPlus className="size-4" />
                        </div>
                        Create Collection
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Group related documents into a dedicated collection.
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
                            <Label htmlFor="collection-name" className="text-xs font-medium">
                                Collection Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="collection-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Legal Agreements, Q3 Roadmap"
                                maxLength={255}
                                autoFocus
                                className="h-9 text-xs sm:text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="collection-desc" className="text-xs font-medium">
                                Description <span className="text-muted-foreground text-[11px] font-normal">(Optional)</span>
                            </Label>
                            <textarea
                                id="collection-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What kind of documents belong here?"
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
                                        Creating...
                                    </>
                                ) : (
                                    "Create Collection"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
