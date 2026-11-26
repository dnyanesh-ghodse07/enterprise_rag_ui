import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CheckCircle2, ListTodo, RefreshCw, X } from "lucide-react";
import { apiPost } from "../../api/client";
import { useApiGet } from "../../hooks/use-api-get";
import { formatDate } from "../../lib/formatters";
import type { DocumentsList } from "../../types/document.types";
import type { JobDetail, JobStatus, JobSummary, StartJobResponse } from "../../types/job.types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import DocJobPicker from "./doc-job-picker";

const JOBS_PER_PAGE = 20;
const POLL_INTERVAL_MS = 3000;

const statusBadges = {
    queued: { label: "Queued", variant: "secondary" },
    processing: { label: "Processing", variant: "info" },
    retrying: { label: "Retrying", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    failed: { label: "Failed", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "outline" },
} as const;

function isActiveJob(status: JobStatus) {
    return status === "queued" || status === "processing" || status === "retrying";
}

function JobProgress({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div
                role="progressbar"
                aria-label={label}
                aria-valuenow={value}
                className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-muted"
            >
                <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
            </div>
            <span className="min-w-10 text-right text-xs tabular-nums text-muted-foreground">{value}%</span>
        </div>
    );
}

interface DocJobsTabProps {
    documents: DocumentsList | null;
    documentsError: Error | null;
    isLoadingDocuments: boolean;
    refreshVersion: number;
}

export default function DocJobsTab({ documents, documentsError, isLoadingDocuments, refreshVersion }: DocJobsTabProps) {
    const [page, setPage] = useState(0);
    const [jobRefreshVersion, setJobRefreshVersion] = useState(0);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const isActionPending = isStarting || cancellingId !== null;
    const version = refreshVersion + jobRefreshVersion;
    const list = useApiGet<JobSummary[]>(`/jobs?limit=${JOBS_PER_PAGE + 1}&offset=${page * JOBS_PER_PAGE}`, version);
    const selected = useApiGet<JobDetail>(selectedJobId ? `/jobs/${selectedJobId}` : null, version);
    const jobs = list.data?.slice(0, JOBS_PER_PAGE) ?? [];
    const hasNextPage = (list.data?.length ?? 0) > JOBS_PER_PAGE;
    const hasActiveJobs = jobs.some((job) => isActiveJob(job.status)) || Boolean(selected.data && isActiveJob(selected.data.status));
    const isRefreshing = list.isLoading || selected.isLoading;
    const documentNames = new Map(documents?.items.map((doc) => [doc.id, doc.title || doc.filename]));

    function refreshJobs() {
        setJobRefreshVersion((current) => current + 1);
    }

    useEffect(() => {
        if (!hasActiveJobs || isRefreshing || isActionPending || list.error || selected.error) return;
        const timer = window.setTimeout(refreshJobs, POLL_INTERVAL_MS);
        return () => window.clearTimeout(timer);
    }, [hasActiveJobs, isRefreshing, isActionPending, list.error, selected.error, version]);

    async function handleStart(documentId: string) {
        if (isActionPending) return false;
        setIsStarting(true);
        setNotification(null);
        try {
            const job = await apiPost<StartJobResponse>(`/jobs/process/${documentId}`);
            setPage(0);
            setSelectedJobId(job.job_id);
            setNotification({ type: "success", text: "Processing job submitted." });
            refreshJobs();
            return true;
        } catch (error) {
            setNotification({ type: "error", text: error instanceof Error && error.message ? error.message : "Failed to start the job. Please try again." });
            return false;
        } finally {
            setIsStarting(false);
        }
    }

    async function handleCancel(jobId: string) {
        if (isActionPending) return;
        setCancellingId(jobId);
        setNotification(null);
        try {
            await apiPost(`/jobs/${jobId}/cancel`);
            setNotification({ type: "success", text: "Processing job cancelled." });
        } catch (error) {
            setNotification({ type: "error", text: error instanceof Error && error.message ? error.message : "Failed to cancel the job. Please try again." });
        } finally {
            refreshJobs();
            setCancellingId(null);
        }
    }

    function changePage(nextPage: number) {
        setSelectedJobId(null);
        setPage(nextPage);
    }

    const details = selectedJobId && (
        <div className="space-y-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Job details</h3>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Close job details" onClick={() => setSelectedJobId(null)}>
                    <X aria-hidden="true" />
                </Button>
            </div>
            <p className="wrap-anywhere text-muted-foreground">Job ID {selectedJobId}</p>
            {selected.isLoading && !selected.data && <Skeleton className="h-5 w-full" role="status" aria-label="Loading job details" />}
            {selected.error && <p role="alert" className="wrap-anywhere text-destructive">{selected.error.message}</p>}
            {selected.data && (
                <div className="space-y-2">
                    <Badge variant={statusBadges[selected.data.status].variant}>{statusBadges[selected.data.status].label}</Badge>
                    <div className="max-w-xs space-y-1">
                        <p className="text-muted-foreground">Overall progress</p>
                        <JobProgress value={selected.data.progress_percent} label="Overall job progress" />
                    </div>
                    {selected.data.current_stage && (
                        <div className="max-w-xs space-y-1">
                            <p className="capitalize text-muted-foreground">{selected.data.current_stage.replaceAll("_", " ")} stage</p>
                            <JobProgress value={selected.data.stage_progress} label="Current stage progress" />
                        </div>
                    )}
                    {selected.data.retry_count > 0 && <p className="text-muted-foreground">Retries {selected.data.retry_count}</p>}
                    {selected.data.error_message && <p className="whitespace-pre-wrap wrap-anywhere text-destructive">{selected.data.error_message}</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
            {notification && (
                <div
                    role={notification.type === "error" ? "alert" : "status"}
                    className={`flex items-start justify-between gap-2 rounded-xl border p-3 text-xs sm:text-sm ${notification.type === "error"
                        ? "border-destructive/20 bg-destructive/10 text-destructive"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}
                >
                    <div className="flex min-w-0 items-start gap-2">
                        {notification.type === "error" ? <AlertCircle aria-hidden="true" className="size-4 shrink-0" /> : <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />}
                        <p className="wrap-anywhere">{notification.text}</p>
                    </div>
                    <button type="button" aria-label="Dismiss notification" className="shrink-0 p-0.5 hover:opacity-80" onClick={() => setNotification(null)}>
                        <X aria-hidden="true" className="size-3.5" />
                    </button>
                </div>
            )}

            <DocJobPicker
                documents={documents}
                documentsError={documentsError}
                isLoadingDocuments={isLoadingDocuments}
                refreshVersion={refreshVersion}
                isStarting={isStarting}
                isActionPending={isActionPending}
                onStart={handleStart}
            />

            <section aria-labelledby="processing-jobs-heading" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="processing-jobs-heading" className="text-sm font-semibold">Processing jobs</h2>
                    <Button type="button" variant="outline" size="sm" disabled={isRefreshing || isActionPending} onClick={refreshJobs}>
                        <RefreshCw aria-hidden="true" className={isRefreshing ? "animate-spin" : undefined} />
                        Refresh jobs
                    </Button>
                </div>
                {list.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{list.error.message}</p>}
                {selectedJobId && !jobs.some((job) => job.id === selectedJobId) && details}
                {list.isLoading && !list.data && <Skeleton className="h-20 w-full rounded-xl" role="status" aria-label="Loading jobs" />}
                {list.data && !jobs.length && (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        <ListTodo aria-hidden="true" className="size-4" /> No processing jobs yet.
                    </div>
                )}
                {jobs.length > 0 && (
                    <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card">
                        {jobs.map((job) => {
                            const { label, variant } = statusBadges[job.status];
                            const isSelected = job.id === selectedJobId;
                            const canCancel = isActiveJob(job.status) && !(isSelected && selected.data && !isActiveJob(selected.data.status));
                            return (
                                <li key={job.id} className="space-y-3 p-3 sm:p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            {job.document_id ? (
                                                <Link to={`/documents/${job.document_id}`} className="block truncate text-sm font-medium hover:underline">
                                                    {documentNames.get(job.document_id) || `Document ${job.document_id}`}
                                                </Link>
                                            ) : <p className="text-sm font-medium capitalize">{job.job_type.replaceAll("_", " ")}</p>}
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant={variant}>{label}</Badge>
                                                {job.current_stage && <span className="capitalize">{job.current_stage.replaceAll("_", " ")}</span>}
                                                {job.created_at && <time dateTime={job.created_at}>{formatDate(job.created_at)}</time>}
                                            </div>
                                        </div>
                                        <div className="sm:w-32 lg:w-48">
                                            <JobProgress value={job.progress_percent} label="Job progress" />
                                        </div>
                                        <div className="flex items-center gap-2 sm:min-w-36 sm:justify-end">
                                            <Button type="button" variant="outline" size="sm" aria-expanded={isSelected} onClick={() => setSelectedJobId(isSelected ? null : job.id)}>
                                                {isSelected ? "Hide details" : "Details"}
                                            </Button>
                                            {canCancel && (
                                                <Button type="button" variant="destructive" size="sm" disabled={isActionPending || list.isLoading} onClick={() => handleCancel(job.id)}>
                                                    {cancellingId === job.id && <Spinner />}
                                                    {cancellingId === job.id ? "Cancelling…" : "Cancel job"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && details}
                                </li>
                            );
                        })}
                    </ul>
                )}
                {(page > 0 || hasNextPage) && (
                    <nav aria-label="Jobs pagination" className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
                        <Button type="button" variant="outline" size="sm" disabled={page === 0 || isActionPending} onClick={() => changePage(page - 1)}>Previous</Button>
                        <span>Page {page + 1}</span>
                        <Button type="button" variant="outline" size="sm" disabled={!hasNextPage || isActionPending} onClick={() => changePage(page + 1)}>Next</Button>
                    </nav>
                )}
            </section>
        </div>
    );
}
