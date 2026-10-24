import { Button } from "../ui/button";
import { RefreshCw, PlusCircle, X, FolderPlus } from "lucide-react";

interface DocHeaderProps {
    onRefresh: () => void;
    isRefreshing?: boolean;
    showUploadForm: boolean;
    onToggleUpload: () => void;
    onNewCollection?: () => void;
}

export default function DocHeader({
    onRefresh,
    isRefreshing = false,
    showUploadForm,
    onToggleUpload,
    onNewCollection,
}: DocHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Document Knowledge Base
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Upload, organize into collections, and explore reference documents used by the AI agent
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="text-xs sm:text-sm"
                    aria-label="Refresh documents"
                >
                    <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>

                {onNewCollection && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNewCollection}
                        className="text-xs sm:text-sm font-medium"
                    >
                        <FolderPlus className="size-3.5 mr-1.5 text-purple-500" />
                        New Collection
                    </Button>
                )}

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
            </div>
        </div>
    );
}
