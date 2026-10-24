import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useDocumentDetail } from "../hooks/use-document-detail";
import { 
    DocDetailHero,
    DocDetailTabs,
    DocPreviewTab,
    DocChunksTab,
    DocVersionsTab,
    DocMetadataTab,
    DocVersionUploadModal,
    DocDeleteDialog,
    MoveDocDialog,
    type DocDetailTabKey
} from "../components/document";
import { 
    ArrowLeft, 
    RefreshCw, 
    AlertCircle, 
    CheckCircle2, 
    X 
} from "lucide-react";

export default function DocumentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Active tab state
    const [activeTab, setActiveTab] = useState<DocDetailTabKey>("preview");

    // Modal dialog states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showVersionUploadModal, setShowVersionUploadModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);

    // Document detail custom hook
    const {
        doc,
        versions,
        chunks,
        processingStatus,
        previewContent,
        previewBlobUrl,
        isLoading,
        isProcessing,
        isDownloading,
        isDeleting,
        isUploadingVersion,
        isEmbedding,
        vectorStatus,
        previewLoading,
        actionMessage,
        isAdminOrOwner,
        clearActionMessage,
        fetchDocumentData,
        processDocument,
        downloadDocument,
        deleteDocument,
        uploadNewVersion,
        embedDocument,
        processAndEmbedDocument,
    } = useDocumentDetail(id);

    // Delete handler with navigation
    const handleDelete = async () => {
        const success = await deleteDocument();
        if (success) {
            navigate("/documents");
        } else {
            setShowDeleteConfirm(false);
        }
    };

    // Initial Loading Skeleton State
    if (isLoading && !doc) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <Card className="p-6 space-y-4">
                    <div className="flex gap-4 items-center">
                        <Skeleton className="size-16 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Not Found State
    if (!doc) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 py-12 text-center">
                <AlertCircle className="size-12 mx-auto text-destructive mb-3" />
                <h2 className="text-lg font-bold">Document Not Found</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    The requested document does not exist or may have been deleted.
                </p>
                <Button onClick={() => navigate("/documents")}>
                    <ArrowLeft className="size-4 mr-2" /> Back to Documents
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-5">
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/documents")}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4 mr-1.5" />
                        Documents
                    </Button>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
                        {doc.title || doc.filename}
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDocumentData}
                    className="text-xs"
                >
                    <RefreshCw className="size-3.5 mr-1.5" />
                    Refresh
                </Button>
            </div>

            {/* Notification alert */}
            {actionMessage && (
                <div className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm ${
                    actionMessage.type === "success" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}>
                    <div className="flex items-center gap-2">
                        {actionMessage.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                        <span>{actionMessage.text}</span>
                    </div>
                    <button onClick={clearActionMessage} className="p-0.5 hover:opacity-80">
                        <X className="size-3.5" />
                    </button>
                </div>
            )}

            {/* Document Hero Card */}
            <DocDetailHero
                doc={doc}
                chunksCount={chunks.length}
                isAdminOrOwner={isAdminOrOwner}
                isProcessing={isProcessing}
                isDownloading={isDownloading}
                isEmbedding={isEmbedding}
                vectorStatus={vectorStatus}
                onProcessAndEmbed={processAndEmbedDocument}
                onDownload={() => downloadDocument()}
                onOpenUploadVersion={() => setShowVersionUploadModal(true)}
                onOpenDeleteConfirm={() => setShowDeleteConfirm(true)}
                onOpenMoveCollection={() => setShowMoveModal(true)}
            />

            {/* Segmented Tab Navigation */}
            <DocDetailTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                chunksCount={chunks.length}
                versionsCount={versions.length}
            />

            {/* Tab 1: File Preview */}
            {activeTab === "preview" && (
                <DocPreviewTab
                    doc={doc}
                    previewContent={previewContent}
                    previewBlobUrl={previewBlobUrl}
                    previewLoading={previewLoading}
                    isDownloading={isDownloading}
                    onDownload={() => downloadDocument()}
                />
            )}

            {/* Tab 2: Knowledge Chunks */}
            {activeTab === "chunks" && (
                <DocChunksTab
                    doc={doc}
                    chunks={chunks}
                    processingStatus={processingStatus}
                    isProcessing={isProcessing}
                    isEmbedding={isEmbedding}
                    vectorStatus={vectorStatus}
                    onProcess={processDocument}
                    onEmbed={embedDocument}
                />
            )}

            {/* Tab 3: All Versions */}
            {activeTab === "versions" && (
                <DocVersionsTab
                    doc={doc}
                    versions={versions}
                    onUploadNewVersion={() => setShowVersionUploadModal(true)}
                    onDownloadVersion={(verNum) => downloadDocument(verNum)}
                />
            )}

            {/* Tab 4: Details & Metadata */}
            {activeTab === "metadata" && (
                <DocMetadataTab
                    doc={doc}
                    chunksCount={chunks.length}
                    vectorStatus={vectorStatus}
                    isEmbedding={isEmbedding}
                    onEmbed={embedDocument}
                />
            )}

            {/* Modal: Upload New Version */}
            <DocVersionUploadModal
                doc={doc}
                isOpen={showVersionUploadModal}
                isUploading={isUploadingVersion}
                onClose={() => setShowVersionUploadModal(false)}
                onUpload={uploadNewVersion}
            />

            {/* Modal: Confirm Delete */}
            <DocDeleteDialog
                doc={doc}
                isOpen={showDeleteConfirm}
                isDeleting={isDeleting}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
            />

            {/* Modal: Move Document to Collection */}
            <MoveDocDialog
                document={doc}
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                onSuccess={() => {
                    fetchDocumentData();
                    setShowMoveModal(false);
                }}
            />
        </div>
    );
}
