import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { apiDelete } from "../../api/client";
import type { Conversation } from "../../types";
import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteConversationDialogProps {
    conversation: Conversation | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (deletedId: string) => void;
}

export default function DeleteConversationDialog({
    conversation,
    isOpen,
    onClose,
    onSuccess,
}: DeleteConversationDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !conversation) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await apiDelete(`/chat/conversations/${conversation.id}`);
            onSuccess(conversation.id);
            onClose();
        } catch (err: any) {
            console.error("Failed to delete conversation", err);
            setError(err?.message || "Failed to delete conversation.");
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
                        Delete Conversation
                    </CardTitle>
                    <CardDescription className="text-xs">
                        This action will permanently remove this conversation history.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-3.5">
                    {error && (
                        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-foreground/80 break-words leading-relaxed">
                        Are you sure you want to delete <strong className="text-foreground">"{conversation.title || "New Chat"}"</strong>? All messages in this thread will be deleted.
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
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
