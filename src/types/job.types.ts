export type JobStatus = "queued" | "processing" | "retrying" | "completed" | "failed" | "cancelled";

interface JobProgress {
    id: string;
    job_type: string;
    status: JobStatus;
    current_stage: string | null;
    progress_percent: number;
    created_at: string | null;
}

export interface JobSummary extends JobProgress {
    document_id: string | null;
}

export interface JobDetail extends JobProgress {
    stage_progress: number;
    retry_count: number;
    error_message: string | null;
}

export interface StartJobResponse {
    job_id: string;
}
