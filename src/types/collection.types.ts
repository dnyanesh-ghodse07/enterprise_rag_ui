export interface CollectionItem {
    id: string;
    name: string;
    description: string | null;
    tenant_id: string;
    created_by: string | null;
    document_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CollectionListResponse {
    items: CollectionItem[];
    total: number;
}

// Kept for backward compatibility with existing code
export type CollectionResponse = CollectionListResponse;

export interface CollectionCreatePayload {
    name: string;
    description?: string | null;
}

export interface CollectionUpdatePayload {
    name?: string | null;
    description?: string | null;
}