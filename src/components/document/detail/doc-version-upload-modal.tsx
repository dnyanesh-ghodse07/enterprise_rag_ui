import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Spinner } from "../../ui/spinner";
import { bytesToMB } from "../../../utils";
import type { Document } from "../../../types/document.types";
import { UploadCloud, X } from "lucide-react";

interface DocVersionUploadModalProps {
    doc: Document;
    isOpen: boolean;
    isUploading: boolean;
    onClose: () => void;
    onUpload: (file: File, changeNote: string) => Promise<boolean>;
}

export default function DocVersionUploadModal({
    doc,
    isOpen,
    isUploading,
    onClose,
    onUpload,
}: DocVersionUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [changeNote, setChangeNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload as the new version.");
            return;
        }

        setError(null);
        try {
            const success = await onUpload(file, changeNote);
            if (success) {
                setFile(null);
                setChangeNote("");
                onClose();
            }
        } catch (err: any) {
            setError(err?.message || "Failed to upload new version.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md bg-background border-border shadow-xl">
                <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">Upload New Version</CardTitle>
                        <CardDescription className="text-xs">
                            Increment document to version {doc.current_version + 1}
                        </CardDescription>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="version-file" className="text-xs font-medium">
                                Select File
                            </Label>
                            <Input
                                id="version-file"
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="text-xs"
                                disabled={isUploading}
                            />
                            {file && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {file.name} ({bytesToMB(file.size)})
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="change-note" className="text-xs font-medium">
                                Change Note <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="change-note"
                                type="text"
                                placeholder="e.g., Updated remote work travel expenses section"
                                value={changeNote}
                                onChange={(e) => setChangeNote(e.target.value)}
                                className="text-xs"
                                disabled={isUploading}
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-destructive">{error}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!file || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Spinner className="size-3.5 mr-1.5" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="size-3.5 mr-1.5" />
                                        Upload Version {doc.current_version + 1}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
