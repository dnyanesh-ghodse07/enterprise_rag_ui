import { useEffect, useState, useMemo, useTransition, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { apiGet } from "../api/client";
import { 
    CollectionDetailHero, 
    EditCollectionDialog, 
    DeleteCollectionDialog 
} from "../components/collection";
import { 
    DocGrid, 
    UploadDoc, 
    MoveDocDialog 
} from "../components/document";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import type { CollectionItem } from "../types/collection.types";
import type { Document, DocumentsList } from "../types/document.types";
import { 
    ArrowLeft, 
    RefreshCw, 
    AlertCircle, 
    CheckCircle2, 
    Search, 
    X,
    PlusCircle 
} from "lucide-react";

export default function CollectionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [collection, setCollection] = useState<CollectionItem | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [totalDocs, setTotalDocs] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUploadForm, setShowUploadForm] = useState(false);

    // Dialog states
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [documentToMove, setDocumentToMove] = useState<Document | null>(null);

    // Message banner
    const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const [isPending, startTransition] = useTransition();

    const fetchCollectionData = useCallback(async () => {
        if (!id) return;
        try {
            const col = await apiGet<CollectionItem>(`/collections/${id}`);
            setCollection(col);
        } catch (err: any) {
            console.error("Failed to load collection", err);
            setNotification({
                text: err?.message || "Failed to load collection details.",
                type: "error",
            });
        }
    }, [id]);

    const fetchCollectionDocuments = useCallback(async () => {
        if (!id) return;
        try {
            const docsRes = await apiGet<DocumentsList>(`/documents?collection_id=${id}&page_size=100`);
            setDocuments(docsRes.items || []);
            setTotalDocs(docsRes.total || 0);
        } catch (err: any) {
            console.error("Failed to load collection documents", err);
        }
    }, [id]);

    const handleRefresh = useCallback(() => {
        startTransition(() => {
            fetchCollectionData();
            fetchCollectionDocuments();
        });
    }, [fetchCollectionData, fetchCollectionDocuments]);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    // Filter documents by local search
    const filteredDocuments = useMemo(() => {
        if (!documents) return [];
        if (!searchQuery.trim()) return documents;

        const q = searchQuery.toLowerCase();
        return documents.filter((doc) =>
            doc.title?.toLowerCase().includes(q) ||
            doc.filename?.toLowerCase().includes(q) ||
            doc.uploader_name?.toLowerCase().includes(q) ||
            doc.description?.toLowerCase().includes(q)
        );
    }, [documents, searchQuery]);

    // Handle collection update
    const handleUpdateSuccess = (updated: CollectionItem) => {
        setCollection(updated);
        setNotification({
            text: `Collection "${updated.name}" updated successfully.`,
            type: "success",
        });
    };

    // Handle collection delete
    const handleDeleteSuccess = () => {
        navigate("/documents");
    };

    // Handle document move success
    const handleMoveSuccess = (movedDoc: Document) => {
        setNotification({
            text: `Document "${movedDoc.title || movedDoc.filename}" moved successfully.`,
            type: "success",
        });
        handleRefresh();
    };

    // Loading skeleton
    if (isPending && !collection) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                    <div className="flex gap-4 items-center">
                        <Skeleton className="size-14 rounded-2xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (!collection && !isPending) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 py-12 text-center">
                <AlertCircle className="size-12 mx-auto text-destructive mb-3" />
                <h2 className="text-lg font-bold">Collection Not Found</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    The requested collection does not exist or may have been deleted.
                </p>
                <Button onClick={() => navigate("/documents")}>
                    <ArrowLeft className="size-4 mr-2" /> Back to Documents
                </Button>
            </div>
        );
    }

    if (!collection) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-5 sm:space-y-6">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/documents")}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <ArrowLeft className="size-4 mr-1.5" />
                        Documents
                    </Button>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">Collections</span>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
                        {collection.name}
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="text-xs"
                >
                    <RefreshCw className={`size-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Notification Alert Banner */}
            {notification && (
                <div className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm animate-in fade-in-50 duration-200 ${
                    notification.type === "success" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                        <span>{notification.text}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="p-0.5 hover:opacity-80">
                        <X className="size-3.5" />
                    </button>
                </div>
            )}

            {/* Collection Details Hero */}
            <CollectionDetailHero
                collection={collection}
                showUploadForm={showUploadForm}
                onToggleUpload={() => setShowUploadForm((prev) => !prev)}
                onOpenEdit={() => setShowEditDialog(true)}
                onOpenDelete={() => setShowDeleteDialog(true)}
            />

            {/* Upload Document to this Collection */}
            {showUploadForm && (
                <div className="transition-all animate-in fade-in-50 duration-200">
                    <UploadDoc 
                        defaultCollectionId={collection.id}
                        onUploadSuccess={() => {
                            handleRefresh();
                            setNotification({
                                text: `Document added to "${collection.name}".`,
                                type: "success",
                            });
                        }} 
                    />
                </div>
            )}

            {/* Collection Documents Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search documents in this collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full text-sm h-9"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                            aria-label="Clear search"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between sm:justify-end text-xs text-muted-foreground">
                    <span>
                        Showing <strong className="text-foreground">{filteredDocuments.length}</strong> of {totalDocs} documents
                    </span>
                    {!showUploadForm && (
                        <button
                            type="button"
                            onClick={() => setShowUploadForm(true)}
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1 sm:hidden ml-3"
                        >
                            <PlusCircle className="size-3" /> Add document
                        </button>
                    )}
                </div>
            </div>

            {/* Collection Documents Grid */}
            <DocGrid
                documents={filteredDocuments}
                isLoading={isPending}
                hasActiveFilters={Boolean(searchQuery)}
                onClearFilters={() => setSearchQuery("")}
                onUploadClick={() => setShowUploadForm(true)}
                onDocumentClick={(doc) => navigate(`/documents/${doc.id}`)}
                onMoveDocument={(doc) => setDocumentToMove(doc)}
            />

            {/* Edit Collection Dialog */}
            <EditCollectionDialog
                collection={collection}
                isOpen={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                onSuccess={handleUpdateSuccess}
            />

            {/* Delete Collection Dialog */}
            <DeleteCollectionDialog
                collection={collection}
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onSuccess={handleDeleteSuccess}
            />

            {/* Move Document Dialog */}
            <MoveDocDialog
                document={documentToMove}
                isOpen={Boolean(documentToMove)}
                onClose={() => setDocumentToMove(null)}
                onSuccess={handleMoveSuccess}
            />
        </div>
    );
}
