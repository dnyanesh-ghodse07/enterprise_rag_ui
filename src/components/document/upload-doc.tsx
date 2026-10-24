import { useEffect, useState, useRef } from "react";
import { apiGet, apiUpload } from "../../api/client";
import type { CollectionResponse } from "../../types/collection.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "../ui/select";
import { Spinner } from "../ui/spinner";
import { Badge } from "../ui/badge";
import { 
    UploadCloud, 
    FileText, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Folder, 
    Layers
} from "lucide-react";

interface UploadDocProps {
    onUploadSuccess?: () => void;
    defaultCollectionId?: string;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function UploadDoc({ onUploadSuccess, defaultCollectionId }: UploadDocProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [collectionId, setCollectionId] = useState<string>(defaultCollectionId || "");
    const [collections, setCollections] = useState<CollectionResponse | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (defaultCollectionId) {
            setCollectionId(defaultCollectionId);
        }
    }, [defaultCollectionId]);

    useEffect(() => {
        apiGet<CollectionResponse>("/collections")
            .then((res) => {
                setCollections(res);
            })
            .catch((err) => {
                console.error("Error fetching collections", err);
            });
    }, []);

    const handleSelectFile = (selectedFile: File | undefined) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setError(null);
        setSuccessMessage(null);
        // Automatically set title if empty
        if (!title.trim()) {
            const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTitle(cleanName);
        }
    };

    const handleClearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleReset = () => {
        handleClearFile();
        setTitle("");
        setDescription("");
        setCollectionId(defaultCollectionId || "");
        setError(null);
        setSuccessMessage(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleSelectFile(droppedFile);
        }
    };

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        if (title.trim()) {
            formData.append("title", title.trim());
        }
        if (description.trim()) {
            formData.append("description", description.trim());
        }
        if (collectionId && collectionId !== "none") {
            formData.append("collection_id", collectionId);
        }

        try {
            setIsUploading(true);
            setError(null);
            setSuccessMessage(null);
            
            await apiUpload("/documents/upload", formData);

            setSuccessMessage(`"${title || file.name}" uploaded successfully!`);
            handleReset();
            onUploadSuccess?.();
        } catch (err: any) {
            console.error("Error uploading document", err);
            setError(err?.message || "Failed to upload document. Please check the file and try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="w-full border-border/80 shadow-xs">
            <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UploadCloud className="size-4" />
                    </div>
                    <div>
                        <CardTitle className="text-base sm:text-lg">Upload Knowledge Document</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Add documents to train and query in your conversational workspace
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleUploadDoc} className="space-y-4">
                    {/* Drag and drop / file selection zone */}
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                                isDragging
                                    ? "border-primary bg-primary/10 scale-[0.99]"
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="doc-file-input"
                                className="hidden"
                                onChange={(e) => handleSelectFile(e.target.files?.[0])}
                            />
                            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                                <UploadCloud className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Tap to upload or drag & drop file here
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                PDF, TXT, DOCX, MD, CSV, JSON (up to 50MB)
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3 sm:p-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {formatBytes(file.size)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {file.type || "Document"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleClearFile}
                                disabled={isUploading}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                aria-label="Remove selected file"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    )}

                    {/* Metadata fields: Mobile friendly responsive grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Title input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="doc-title" className="text-xs font-medium">
                                Document Title
                            </Label>
                            <Input
                                id="doc-title"
                                type="text"
                                placeholder="e.g. Q3 Financial Report"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isUploading}
                                className="w-full text-sm"
                            />
                        </div>

                        {/* Collection select */}
                        <div className="space-y-1.5">
                            <Label htmlFor="doc-collection" className="text-xs font-medium">
                                Collection <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Select
                                value={collectionId}
                                onValueChange={(val) => setCollectionId(val ?? "")}
                                disabled={isUploading}
                            >
                                <SelectTrigger id="doc-collection" className="w-full text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Folder className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue placeholder="Select a collection" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-56">
                                    <SelectGroup>
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground">General (No Collection)</span>
                                        </SelectItem>
                                        {collections?.items?.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                <div className="flex items-center gap-2">
                                                    <Layers className="size-3.5 text-muted-foreground" />
                                                    <span>{item.name}</span>
                                                    {item.document_count !== undefined && (
                                                        <span className="text-xs text-muted-foreground">
                                                            ({item.document_count})
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description field - full width */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="doc-desc" className="text-xs font-medium">
                                Description <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="doc-desc"
                                type="text"
                                placeholder="Brief summary of the document content or purpose..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isUploading}
                                className="w-full text-sm"
                            />
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span className="break-words">{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span className="break-words">{successMessage}</span>
                        </div>
                    )}

                    {/* Actions: Full width on mobile, right-aligned on desktop */}
                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:items-center">
                        {(file || title || description || collectionId) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={isUploading}
                                className="w-full sm:w-auto text-muted-foreground"
                            >
                                Reset
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="default"
                            disabled={!file || isUploading}
                            className="w-full sm:w-auto font-medium"
                        >
                            {isUploading ? (
                                <>
                                    <Spinner className="size-4 mr-2" />
                                    <span>Uploading document...</span>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="size-4 mr-2" />
                                    <span>Upload Document</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}