import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";
import type { Document } from "../../../types/document.types";
import { AlertCircle } from "lucide-react";

interface DocDeleteDialogProps {
    doc: Document;
    isOpen: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DocDeleteDialog({
    doc,
    isOpen,
    isDeleting,
    onClose,
    onConfirm,
}: DocDeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-sm bg-background border-border shadow-xl">
                <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                        <AlertCircle className="size-5" />
                        Delete Document
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Are you sure you want to delete this document?
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-foreground/80 break-words">
                        <strong>"{doc.title || doc.filename}"</strong> will be removed from your knowledge base and vector index.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
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
                            onClick={onConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Spinner className="size-3.5 mr-1.5" />
                                    Deleting...
                                </>
                            ) : (
                                "Confirm Delete"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
