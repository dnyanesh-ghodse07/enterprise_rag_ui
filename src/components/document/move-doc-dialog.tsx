import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Spinner } from "../ui/spinner";
import { apiGet, apiPatch } from "../../api/client";
import type { Document } from "../../types/document.types";
import type { CollectionResponse, CollectionItem } from "../../types/collection.types";
import { FolderInput, Folder, AlertCircle } from "lucide-react";

interface MoveDocDialogProps {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedDoc: Document) => void;
}

export default function MoveDocDialog({
    document,
    isOpen,
    onClose,
    onSuccess,
}: MoveDocDialogProps) {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>("none");
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !document) return;

        // Reset state
        setSelectedCollectionId(document.collection_id || "none");
        setError(null);

        setIsLoadingCollections(true);
        apiGet<CollectionResponse>("/collections")
            .then((res) => {
                setCollections(res.items || []);
            })
            .catch((err) => {
                console.error("Failed to load collections", err);
                setError("Failed to load collections list.");
            })
            .finally(() => {
                setIsLoadingCollections(false);
            });
    }, [isOpen, document]);

    if (!isOpen || !document) return null;

    const handleMove = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsMoving(true);

        const newCollectionId = selectedCollectionId === "none" ? null : selectedCollectionId;

        // If no change, just close
        if (newCollectionId === (document.collection_id || null)) {
            onClose();
            setIsMoving(false);
            return;
        }

        try {
            const updated = await apiPatch<Document>(`/documents/${document.id}`, {
                collection_id: newCollectionId,
            });
            onSuccess(updated);
            onClose();
        } catch (err: any) {
            console.error("Error moving document to collection", err);
            setError(err?.message || "Failed to move document. Please try again.");
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150">
            <Card className="w-full max-w-md bg-background border-border shadow-xl">
                <CardHeader className="p-4 pb-3 border-b border-border/60">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <FolderInput className="size-4" />
                        </div>
                        Move Document
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Assign or change the collection for this document.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-5">
                    <form onSubmit={handleMove} className="space-y-4">
                        {error && (
                            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-xs space-y-1">
                            <p className="font-medium text-foreground truncate" title={document.title || document.filename}>
                                {document.title || document.filename}
                            </p>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span>Current collection:</span>
                                <span className="font-medium text-foreground/90">
                                    {document.collection_name || "General knowledge (None)"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">
                                Select Destination Collection
                            </label>

                            {isLoadingCollections ? (
                                <div className="h-9 flex items-center justify-center border rounded-md text-xs text-muted-foreground gap-2">
                                    <Spinner className="size-3.5" /> Loading collections...
                                </div>
                            ) : (
                                <Select
                                    value={selectedCollectionId}
                                    onValueChange={(val) => setSelectedCollectionId(val ?? "none")}
                                >
                                    <SelectTrigger className="w-full text-xs sm:text-sm h-9">
                                        <SelectValue placeholder="Choose a collection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="none">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-muted-foreground">No Collection (General knowledge)</span>
                                                </div>
                                            </SelectItem>
                                            {collections.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Folder className="size-3.5 text-purple-500 shrink-0" />
                                                        <span className="truncate">{col.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            ({col.document_count ?? 0} docs)
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={isMoving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isMoving || isLoadingCollections}
                            >
                                {isMoving ? (
                                    <>
                                        <Spinner className="size-3.5 mr-1.5" />
                                        Moving...
                                    </>
                                ) : (
                                    "Move Document"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
