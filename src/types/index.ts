/**
 * Core type definitions for Cognix frontend.
 * 
 * These types mirror the backend API schemas.
 * TypeScript ensures we never send wrong data to the API
 * or mishandle the response.
 */

// ─── Auth Types ──────────────────────────────────────
export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
    last_login_at?: string;
    tenant_name?: string;
    created_at?: string;
    is_active?: boolean;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    tenant: {
        name: string;
        slug: string;
    };
}

export interface PasswordChangeRequest {
    current_password: string;
    new_password: string;
}

export interface PasswordChangeResponse {
    message: string;
}

export interface TokenRefreshRequest {
    refresh_token: string;
}

// ─── Chat Types ──────────────────────────────────────
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceReference[];
    isStreaming?: boolean;
    metadata?: ChatMetadata;
    created_at?: string;
}

export interface SourceReference {
    index: number;
    document_id: string;
    document_title?: string;
    page_number?: number;
    section_heading?: string;
    relevance_score: number;
}

export interface ChatMetadata {
    model?: string;
    query_type?: string;
    rewritten_query?: string;
    total_tokens?: number;
    cost_estimate?: number;
    total_time_ms?: number;
    chunks_retrieved?: number;
}

export interface ChatRequest {
    question: string;
    conversation_id?: string;
    document_ids?: string[];
    stream: boolean;
}

export interface ChatResponse {
    answer: string;
    conversation_id: string;
    sources: SourceReference[];
    metadata: ChatMetadata;
}

// ─── Conversation Types ──────────────────────────────
export interface Conversation {
    id: string;
    title: string;
    message_count: number;
    created_at?: string;
    updated_at?: string;
}

// ─── Document Types ──────────────────────────────────
export interface Document {
    id: string;
    title: string;
    filename: string;
    mime_type: string;
    file_size: number;
    status: 'uploaded' | 'processing' | 'ready' | 'error';
    current_version: number;
    created_at: string;
}

// ─── SSE Stream Types ────────────────────────────────
export type StreamEvent =
    | { type: 'plan'; query_type: string; rewritten_query: string }
    | { type: 'sources'; sources: SourceReference[] }
    | { type: 'token'; content: string }
    | { type: 'done'; conversation_id: string }
    | { type: 'error'; message: string };

// ─── UI State Types ──────────────────────────────────
export type ChatStatus = 'idle' | 'searching' | 'streaming' | 'complete' | 'error';
