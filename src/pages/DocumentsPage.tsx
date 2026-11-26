import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useApiGet } from "../hooks/use-api-get";
import { 
    DocHeader, 
    DocStats, 
    DocFilters, 
    DocGrid, 
    UploadDoc, 
    MoveDocDialog 
} from "../components/document";
import DocJobsTab from "../components/document/doc-jobs-tab";
import { 
    CollectionGrid, 
    CreateCollectionDialog, 
    EditCollectionDialog, 
    DeleteCollectionDialog 
} from "../components/collection";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import type { Document, DocumentsList, DocStats as DocStatsType } from "../types/document.types";
import type { CollectionItem, CollectionResponse } from "../types/collection.types";
import { 
    Files, 
    Folder, 
    FolderPlus, 
    PlusCircle, 
    Search, 
    X, 
    CheckCircle2, 
    AlertCircle,
    ListTodo
} from "lucide-react";

type ActiveTab = "documents" | "collections" | "jobs";

export default function DocumentPage() {
    const navigate = useNavigate();
    const [refreshVersion, setRefreshVersion] = useState(0);
    const { data: documents, error: documentsError, isLoading: isLoadingDocuments } = useApiGet<DocumentsList>("/documents?page_size=100", refreshVersion);
    const { data: docStats, isLoading: isLoadingDocStats } = useApiGet<DocStatsType>("/documents/stats", refreshVersion);
    const { data: collectionList, isLoading: isLoadingCollections } = useApiGet<CollectionResponse>("/collections", refreshVersion);
    const showDocumentCountSkeleton = isLoadingDocuments && !documents;

    const [activeTab, setActiveTab] = useState<ActiveTab>("documents");

    // Documents state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCollection, setSelectedCollection] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [showUploadForm, setShowUploadForm] = useState(false);

    // Collections state
    const [collectionSearchQuery, setCollectionSearchQuery] = useState("");

    // Dialogs state
    const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false);
    const [collectionToEdit, setCollectionToEdit] = useState<CollectionItem | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<CollectionItem | null>(null);
    const [documentToMove, setDocumentToMove] = useState<Document | null>(null);

    // Toast Notification message
    const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleRefresh = () => setRefreshVersion((version) => version + 1);

    function selectTab(tab: ActiveTab) {
        if (activeTab === "jobs" && tab !== "jobs") handleRefresh();
        setActiveTab(tab);
    }

    // Filter documents based on query, collection, and status
    const filteredDocuments = useMemo(() => {
        if (!documents?.items) return [];

        return documents.items.filter((doc: Document) => {
            const matchesSearch =
                !searchQuery.trim() ||
                doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.collection_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.uploader_name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCollection =
                selectedCollection === "all" ||
                (selectedCollection === "none" && !doc.collection_id) ||
                doc.collection_id === selectedCollection ||
                doc.collection_name === selectedCollection;

            const matchesStatus =
                selectedStatus === "all" ||
                doc.status?.toLowerCase() === selectedStatus.toLowerCase();

            return matchesSearch && matchesCollection && matchesStatus;
        });
    }, [documents, searchQuery, selectedCollection, selectedStatus]);

    // Filter collections based on search query
    const filteredCollections = useMemo(() => {
        const collections = collectionList?.items ?? [];
        if (!collectionSearchQuery.trim()) return collections;

        const q = collectionSearchQuery.toLowerCase();
        return collections.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.description && c.description.toLowerCase().includes(q))
        );
    }, [collectionList, collectionSearchQuery]);

    const hasActiveDocFilters = 
        searchQuery !== "" || 
        selectedCollection !== "all" || 
        selectedStatus !== "all";

    const handleClearDocFilters = () => {
        setSearchQuery("");
        setSelectedCollection("all");
        setSelectedStatus("all");
    };

    // Dialog success handlers
    const handleCollectionCreated = (newCol: CollectionItem) => {
        setNotification({
            text: `Collection "${newCol.name}" created successfully.`,
            type: "success",
        });
        handleRefresh();
    };

    const handleCollectionUpdated = (updatedCol: CollectionItem) => {
        setNotification({
            text: `Collection "${updatedCol.name}" updated successfully.`,
            type: "success",
        });
        handleRefresh();
    };

    const handleCollectionDeleted = () => {
        setNotification({
            text: `Collection deleted successfully.`,
            type: "success",
        });
        handleRefresh();
    };

    const handleDocumentMoved = (movedDoc: Document) => {
        setNotification({
            text: `Document "${movedDoc.title || movedDoc.filename}" moved to ${movedDoc.collection_name || "General knowledge"}.`,
            type: "success",
        });
        handleRefresh();
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-5 sm:space-y-6">
            {/* Modular Header */}
            <DocHeader
                onRefresh={handleRefresh}
                isRefreshing={isLoadingDocuments || isLoadingDocStats || isLoadingCollections}
                showUploadForm={showUploadForm}
                onToggleUpload={() => setShowUploadForm((prev) => !prev)}
                onNewCollection={() => setShowCreateCollectionDialog(true)}
            />

            {/* Notification alert banner */}
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

            {/* Modular Statistics Grid */}
            <DocStats
                stats={docStats}
                isLoading={isLoadingDocStats}
            />

            {/* Modular Upload Form */}
            {showUploadForm && (
                <div className="transition-all animate-in fade-in-50 duration-200">
                    <UploadDoc onUploadSuccess={handleRefresh} />
                </div>
            )}

            {/* View Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => selectTab("documents")}
                        aria-pressed={activeTab === "documents"}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                            activeTab === "documents"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                    >
                        <Files className="size-4" />
                        <span>Documents</span>
                        {showDocumentCountSkeleton ? (
                            <Skeleton as="span" className="h-3.5 w-5" aria-hidden="true" />
                        ) : (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                activeTab === "documents"
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}>
                                {documents?.total ?? 0}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => selectTab("collections")}
                        aria-pressed={activeTab === "collections"}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                            activeTab === "collections"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                    >
                        <Folder className="size-4" />
                        <span>Collections</span>
                        {isLoadingCollections ? (
                            <Skeleton as="span" className="h-3.5 w-5" aria-hidden="true" />
                        ) : (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                activeTab === "collections"
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}>
                                {collectionList?.items?.length ?? 0}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => selectTab("jobs")}
                        aria-pressed={activeTab === "jobs"}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                            activeTab === "jobs"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                    >
                        <ListTodo aria-hidden="true" className="size-4" />
                        <span>Jobs</span>
                    </button>
                </div>

                {/* Sub-actions in tab bar */}
                <div className="flex items-center gap-2">
                    {activeTab === "collections" && (
                        <Button
                            size="sm"
                            onClick={() => setShowCreateCollectionDialog(true)}
                            className="text-xs font-medium"
                        >
                            <FolderPlus className="size-3.5 mr-1.5" />
                            New Collection
                        </Button>
                    )}
                    {activeTab === "documents" && (showDocumentCountSkeleton ? (
                        <Skeleton className="hidden h-4 w-36 sm:block" aria-hidden="true" />
                    ) : (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            Showing <strong className="text-foreground">{filteredDocuments.length}</strong> of {documents?.total ?? 0} documents
                        </span>
                    ))}
                </div>
            </div>

            {/* Tab 1: Documents View */}
            {activeTab === "documents" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                    {/* Modular Search and Filter Bar */}
                    <DocFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCollection={selectedCollection}
                        onCollectionChange={setSelectedCollection}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        collectionsMap={docStats?.count_by_collection}
                        hasActiveFilters={hasActiveDocFilters}
                        onClearFilters={handleClearDocFilters}
                    />

                    {/* Results counter for mobile */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5 sm:hidden">
                        {showDocumentCountSkeleton ? (
                            <Skeleton className="h-4 w-36" aria-hidden="true" />
                        ) : (
                            <span>
                                Showing <strong className="text-foreground">{filteredDocuments.length}</strong> of {documents?.total ?? 0} documents
                            </span>
                        )}
                        {!showUploadForm && (
                            <button
                                type="button"
                                onClick={() => setShowUploadForm(true)}
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                            >
                                <PlusCircle className="size-3" /> Upload new
                            </button>
                        )}
                    </div>

                    {/* Modular Documents Grid */}
                    <DocGrid
                        documents={filteredDocuments}
                        isLoading={isLoadingDocuments}
                        hasActiveFilters={hasActiveDocFilters}
                        onClearFilters={handleClearDocFilters}
                        onUploadClick={() => setShowUploadForm(true)}
                        onDocumentClick={(doc) => navigate(`/documents/${doc.id}`)}
                        onMoveDocument={(doc) => setDocumentToMove(doc)}
                    />
                </div>
            )}

            {/* Tab 2: Collections View */}
            {activeTab === "collections" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                    {/* Search Collections Bar */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search collections by name or description..."
                                value={collectionSearchQuery}
                                onChange={(e) => setCollectionSearchQuery(e.target.value)}
                                className="pl-9 w-full text-sm h-9"
                            />
                            {collectionSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setCollectionSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                    aria-label="Clear search"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {isLoadingCollections ? (
                            <Skeleton className="h-4 w-36" aria-hidden="true" />
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Showing <strong className="text-foreground">{filteredCollections.length}</strong> of {collectionList?.items?.length ?? 0} collections
                            </span>
                        )}
                    </div>

                    {/* Collections Grid */}
                    <CollectionGrid
                        collections={filteredCollections}
                        isLoading={isLoadingCollections}
                        hasActiveFilters={Boolean(collectionSearchQuery)}
                        onClearFilters={() => setCollectionSearchQuery("")}
                        onCreateClick={() => setShowCreateCollectionDialog(true)}
                        onCollectionClick={(col) => navigate(`/documents/collection/${col.id}`)}
                        onEditCollection={(col) => setCollectionToEdit(col)}
                        onDeleteCollection={(col) => setCollectionToDelete(col)}
                    />
                </div>
            )}

            {activeTab === "jobs" && (
                <DocJobsTab
                    documents={documents}
                    documentsError={documentsError}
                    isLoadingDocuments={isLoadingDocuments}
                    refreshVersion={refreshVersion}
                />
            )}

            {/* Create Collection Dialog */}
            <CreateCollectionDialog
                isOpen={showCreateCollectionDialog}
                onClose={() => setShowCreateCollectionDialog(false)}
                onSuccess={handleCollectionCreated}
            />

            {/* Edit Collection Dialog */}
            <EditCollectionDialog
                collection={collectionToEdit}
                isOpen={Boolean(collectionToEdit)}
                onClose={() => setCollectionToEdit(null)}
                onSuccess={handleCollectionUpdated}
            />

            {/* Delete Collection Dialog */}
            <DeleteCollectionDialog
                collection={collectionToDelete}
                isOpen={Boolean(collectionToDelete)}
                onClose={() => setCollectionToDelete(null)}
                onSuccess={handleCollectionDeleted}
            />

            {/* Move Document Dialog */}
            <MoveDocDialog
                document={documentToMove}
                isOpen={Boolean(documentToMove)}
                onClose={() => setDocumentToMove(null)}
                onSuccess={handleDocumentMoved}
            />
        </div>
    );
}
