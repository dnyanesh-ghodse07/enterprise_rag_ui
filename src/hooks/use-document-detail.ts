import { useState, useEffect, useCallback, useRef } from "react";
import { 
    apiGet, 
    apiPost, 
    apiDelete, 
    apiUpload, 
    getCurrentUser 
} from "../api/client";
import { 
    downloadFileFromUrl, 
    resolveBackendFileUrl, 
    getFileTypeFlags 
} from "../utils/file.utils";
import type { 
    Document, 
    DocumentVersion, 
    DocumentChunk, 
    ProcessingStatus, 
    DocumentDownloadResponse,
    EmbedDocumentResponse,
    VectorStatusInfo 
} from "../types/document.types";
import type { User } from "../types";

export interface ActionFeedback {
    type: "success" | "error";
    text: string;
}

export function useDocumentDetail(id?: string) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((user) => {
                if (user) setCurrentUser(user);
            })
            .catch(() => {
                // ignore unauthenticated in hook
            });
    }, []);

    // Data states
    const [doc, setDoc] = useState<Document | null>(null);
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [chunks, setChunks] = useState<DocumentChunk[]>([]);
    const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

    // Vector embedding state
    const [isEmbedding, setIsEmbedding] = useState(false);
    const [vectorStatus, setVectorStatus] = useState<VectorStatusInfo | null>(() => {
        if (!id) return null;
        try {
            const saved = localStorage.getItem(`doc_vector_status_${id}`);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Loading & Action states
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploadingVersion, setIsUploadingVersion] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Feedback message
    const [actionMessage, setActionMessage] = useState<ActionFeedback | null>(null);

    // Keep track of active blob url for cleanup
    const activeBlobUrlRef = useRef<string | null>(null);

    const cleanupBlobUrl = useCallback(() => {
        if (activeBlobUrlRef.current) {
            URL.revokeObjectURL(activeBlobUrlRef.current);
            activeBlobUrlRef.current = null;
            setPreviewBlobUrl(null);
        }
    }, []);

    // Check user role permission for deleting
    const isAdminOrOwner = Boolean(
        currentUser?.role === "admin" || 
        currentUser?.role === "owner" || 
        (currentUser?.id && doc && currentUser.id === doc.uploaded_by)
    );

    // Load document data and preview
    const fetchDocumentData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [docData, versionsData, chunksData, statusData] = await Promise.all([
                apiGet<Document>(`/documents/${id}`),
                apiGet<DocumentVersion[]>(`/documents/${id}/versions`).catch(() => []),
                apiGet<DocumentChunk[]>(`/documents/${id}/chunks`).catch(() => []),
                apiGet<ProcessingStatus>(`/documents/${id}/processing-status`).catch(() => null),
            ]);

            setDoc(docData);
            setVersions(versionsData || []);
            setChunks(chunksData || []);
            setProcessingStatus(statusData);

            // Update vector status info
            try {
                const saved = localStorage.getItem(`doc_vector_status_${id}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setVectorStatus({
                        ...parsed,
                        totalChunks: chunksData?.length || parsed.totalChunks || 0,
                    });
                } else if (docData.status === "ready" && chunksData && chunksData.length > 0) {
                    setVectorStatus({
                        isEmbedded: true,
                        chunksEmbedded: chunksData.length,
                        totalChunks: chunksData.length,
                        model: "text-embedding-3-small (1536d)",
                        status: "embedded",
                    });
                } else {
                    setVectorStatus({
                        isEmbedded: false,
                        chunksEmbedded: 0,
                        totalChunks: chunksData?.length || 0,
                        status: "unembedded",
                    });
                }
            } catch {
                // ignore storage error
            }

            // Fetch file preview
            const { isMarkdown, isText, isJson, isPdf, isImage } = getFileTypeFlags(
                docData.filename,
                docData.mime_type
            );

            if (isMarkdown || isText || isJson || isPdf || isImage) {
                setPreviewLoading(true);
                cleanupBlobUrl();
                setPreviewContent(null);

                try {
                    const dl = await apiGet<DocumentDownloadResponse>(`/documents/${id}/download`);
                    if (dl?.download_url) {
                        const fileUrl = resolveBackendFileUrl(dl.download_url);
                        const token = localStorage.getItem("access_token");
                        const fileRes = await fetch(fileUrl, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                        });

                        if (fileRes.ok) {
                            if (isPdf) {
                                const blob = await fileRes.blob();
                                const pdfBlob = new Blob([blob], { type: "application/pdf" });
                                const blobUrl = URL.createObjectURL(pdfBlob);
                                activeBlobUrlRef.current = blobUrl;
                                setPreviewBlobUrl(blobUrl);
                            } else if (isImage) {
                                const blob = await fileRes.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                activeBlobUrlRef.current = blobUrl;
                                setPreviewBlobUrl(blobUrl);
                            } else {
                                const text = await fileRes.text();
                                const trimmed = text.trim();
                                if (
                                    !trimmed.startsWith("<!DOCTYPE html") && 
                                    !trimmed.startsWith("<!doctype html>") && 
                                    !trimmed.startsWith("<html")
                                ) {
                                    setPreviewContent(text);
                                }
                            }
                        }
                    }
                } catch (previewErr) {
                    console.warn("Could not load preview:", previewErr);
                } finally {
                    setPreviewLoading(false);
                }
            }
        } catch (err: any) {
            console.error("Error loading document:", err);
            setActionMessage({ type: "error", text: err?.message || "Failed to load document details." });
        } finally {
            setIsLoading(false);
        }
    }, [id, cleanupBlobUrl]);

    useEffect(() => {
        fetchDocumentData();
        return () => {
            cleanupBlobUrl();
        };
    }, [fetchDocumentData, cleanupBlobUrl]);

    // Action: Process Document
    const processDocument = async (): Promise<boolean> => {
        if (!id) return false;
        setIsProcessing(true);
        setActionMessage(null);
        try {
            await apiPost(`/documents/${id}/process`);
            setActionMessage({ type: "success", text: "Document processed and indexed successfully!" });
            await fetchDocumentData();
            return true;
        } catch (err: any) {
            console.error("Processing error:", err);
            setActionMessage({ type: "error", text: err?.message || "Failed to process document." });
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    // Action: Download File
    const downloadDocument = async (versionNumber?: number): Promise<void> => {
        if (!id) return;
        setIsDownloading(true);
        try {
            const endpoint = versionNumber 
                ? `/documents/${id}/download?version=${versionNumber}` 
                : `/documents/${id}/download`;
            const res = await apiGet<DocumentDownloadResponse>(endpoint);
            if (res.download_url) {
                const targetFilename = res.filename || doc?.filename || "document";
                await downloadFileFromUrl(res.download_url, targetFilename);
            }
        } catch (err: any) {
            console.error("Download error:", err);
            setActionMessage({ type: "error", text: err?.message || "Failed to download document." });
        } finally {
            setIsDownloading(false);
        }
    };

    // Action: Delete Document
    const deleteDocument = async (): Promise<boolean> => {
        if (!id || !isAdminOrOwner) return false;
        setIsDeleting(true);
        try {
            await apiDelete(`/documents/${id}`);
            return true;
        } catch (err: any) {
            console.error("Delete error:", err);
            setActionMessage({ type: "error", text: err?.message || "Failed to delete document." });
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    // Action: Upload New Version
    const uploadNewVersion = async (file: File, changeNote?: string): Promise<boolean> => {
        if (!id || !file) return false;
        setIsUploadingVersion(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (changeNote?.trim()) {
                formData.append("change_note", changeNote.trim());
            }
            await apiUpload(`/documents/${id}/versions`, formData);
            setActionMessage({ type: "success", text: "New document version uploaded successfully!" });
            await fetchDocumentData();
            return true;
        } catch (err: any) {
            console.error("Version upload error:", err);
            throw err;
        } finally {
            setIsUploadingVersion(false);
        }
    };

    // Action: Process & Embed Document in Vector Store
    const processAndEmbedDocument = async (): Promise<boolean> => {
        if (!id) return false;
        setIsEmbedding(true);
        setActionMessage(null);
        try {
            const res = await apiPost<EmbedDocumentResponse>("/search/process-and-embed", {
                document_id: id,
            });

            if (res.success === false) {
                throw new Error(res.error || "Processing and vector embedding failed.");
            }

            const embeddedCount = res.chunks_embedded ?? chunks.length ?? 0;
            const totalCount = res.total_chunks ?? chunks.length ?? 0;

            const updatedStatus: VectorStatusInfo = {
                isEmbedded: true,
                chunksEmbedded: embeddedCount,
                totalChunks: totalCount,
                embeddedAt: new Date().toISOString(),
                model: "text-embedding-3-small (1536d)",
                status: "embedded",
            };

            setVectorStatus(updatedStatus);
            try {
                localStorage.setItem(`doc_vector_status_${id}`, JSON.stringify(updatedStatus));
            } catch {
                // ignore storage error
            }

            setActionMessage({
                type: "success",
                text: `Document processed and vectorized! ${embeddedCount} chunks stored in Qdrant vector database.`,
            });

            await fetchDocumentData();
            return true;
        } catch (err: any) {
            console.error("Process and embed error:", err);
            setActionMessage({
                type: "error",
                text: err?.message || "Failed to process and vectorize document.",
            });
            return false;
        } finally {
            setIsEmbedding(false);
        }
    };

    // Action: Embed Document in Vector Store (flexible endpoint)
    const embedDocument = async (options?: { fullPipeline?: boolean }): Promise<boolean> => {
        if (!id) return false;
        if (options?.fullPipeline !== false) {
            return processAndEmbedDocument();
        }
        setIsEmbedding(true);
        setActionMessage(null);
        try {
            const res = await apiPost<EmbedDocumentResponse>("/search/embed", {
                document_id: id,
            });

            if (res.success === false) {
                throw new Error(res.error || "Vector embedding failed.");
            }

            const embeddedCount = res.chunks_embedded ?? chunks.length ?? 0;
            const totalCount = res.total_chunks ?? chunks.length ?? 0;

            const updatedStatus: VectorStatusInfo = {
                isEmbedded: true,
                chunksEmbedded: embeddedCount,
                totalChunks: totalCount,
                embeddedAt: new Date().toISOString(),
                model: "text-embedding-3-small (1536d)",
                status: "embedded",
            };

            setVectorStatus(updatedStatus);
            try {
                localStorage.setItem(`doc_vector_status_${id}`, JSON.stringify(updatedStatus));
            } catch {
                // ignore storage error
            }

            setActionMessage({
                type: "success",
                text: `Document successfully vectorized! ${embeddedCount} chunks indexed into Qdrant vector database.`,
            });

            await fetchDocumentData();
            return true;
        } catch (err: any) {
            console.error("Embedding error:", err);
            setActionMessage({
                type: "error",
                text: err?.message || "Failed to embed document in vector store.",
            });
            return false;
        } finally {
            setIsEmbedding(false);
        }
    };

    return {
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
        setActionMessage,
        clearActionMessage: () => setActionMessage(null),
        fetchDocumentData,
        processDocument,
        downloadDocument,
        deleteDocument,
        uploadNewVersion,
        embedDocument,
        processAndEmbedDocument,
    };
}
