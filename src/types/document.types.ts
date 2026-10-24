export interface Document {
    id: string;
    title: string;
    filename: string;
    description: string | null;
    mime_type: string;
    file_size: number;
    status: string;
    current_version: number;
    collection_id: string | null;
    collection_name: string | null;
    uploaded_by: string;
    uploader_name: string;
    tenant_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DocumentsList {
    items: Document[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface DocStats {
    total: number;
    storage: number;
    count_by_collection: {
        [collectionName: string]: number;
    };
    count_by_status: {
        ready: number;
        error: number;
        [status: string]: number;
    };
}

export interface DocumentVersion {
    id: string;
    document_id: string;
    version_number: number;
    file_size: number;
    mime_type: string;
    checksum?: string;
    uploaded_by: string;
    change_note?: string | null;
    created_at: string;
}

export interface DocumentChunk {
    id: string;
    chunk_index: number;
    content: string;
    token_count: number;
    page_number?: number | null;
    section_heading?: string | null;
    version: number;
}

export interface ProcessingStatus {
    document_id: string;
    status: string;
    chunks: number;
    total_tokens: number;
    current_version: number;
}

export interface DocumentDownloadResponse {
    download_url: string;
    filename: string;
    mime_type: string;
    file_size: number;
    expires_in: number;
}

export interface EmbedDocumentResponse {
    success: boolean;
    document_id: string;
    chunks_embedded?: number;
    total_chunks?: number;
    skipped?: number;
    pipeline?: string;
    error?: string;
}

export interface VectorStatusInfo {
    isEmbedded: boolean;
    chunksEmbedded: number;
    totalChunks: number;
    embeddedAt?: string;
    model?: string;
    status: "embedded" | "processing" | "unembedded" | "error";
}
