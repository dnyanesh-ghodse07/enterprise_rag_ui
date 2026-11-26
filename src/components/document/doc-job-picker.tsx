import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useApiGet } from "../../hooks/use-api-get";
import type { DocumentsList } from "../../types/document.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Spinner } from "../ui/spinner";

interface DocJobPickerProps {
    documents: DocumentsList | null;
    documentsError: Error | null;
    isLoadingDocuments: boolean;
    refreshVersion: number;
    isStarting: boolean;
    isActionPending: boolean;
    onStart: (documentId: string) => Promise<boolean>;
}

export default function DocJobPicker({
    documents,
    documentsError,
    isLoadingDocuments,
    refreshVersion,
    isStarting,
    isActionPending,
    onStart,
}: DocJobPickerProps) {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState({ search: "", page: 1 });
    const [documentId, setDocumentId] = useState<string | null>(null);
    const searchTerm = search.trim();

    useEffect(() => {
        if (query.search === searchTerm) return;
        const timer = window.setTimeout(() => setQuery({ search: searchTerm, page: 1 }), 250);
        return () => window.clearTimeout(timer);
    }, [query.search, searchTerm]);

    const usePageDocuments = !query.search && query.page === 1;
    const params = new URLSearchParams({ page: String(query.page), page_size: "100" });
    if (query.search) params.set("search", query.search);
    const results = useApiGet<DocumentsList>(usePageDocuments ? null : `/documents?${params}`, refreshVersion);
    const data = usePageDocuments ? documents : results.data;
    const error = usePageDocuments ? documentsError : results.error;
    const isLoading = searchTerm !== query.search || (usePageDocuments ? isLoadingDocuments : results.isLoading);
    const options = (data?.items ?? []).map((doc) => ({ value: doc.id, label: doc.title || doc.filename }));
    const totalPages = data?.total_pages ?? 0;

    const changePage = (page: number) => {
        setDocumentId(null);
        setQuery({ ...query, page });
    };

    return (
        <form
            className="space-y-3 rounded-xl border border-border/70 bg-card p-3 sm:p-4"
            onSubmit={async (event) => {
                event.preventDefault();
                if (documentId && !error && !isLoading && !isActionPending && await onStart(documentId)) {
                    setDocumentId(null);
                }
            }}
        >
            <h2 className="text-sm font-semibold">Start a processing job</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    type="search"
                    value={search}
                    maxLength={200}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setDocumentId(null);
                    }}
                    aria-label="Search documents for processing"
                    placeholder="Search by title or filename"
                    className="h-9 min-w-0 sm:flex-1"
                    disabled={isStarting}
                />
                <Select items={options} value={documentId} onValueChange={setDocumentId} disabled={isLoading || isStarting || Boolean(error) || !options.length}>
                    <SelectTrigger aria-label="Document to process" className="h-9 w-full min-w-0 border-border sm:flex-1">
                        <SelectValue placeholder={isLoading ? "Loading documents…" : "Choose a document"} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button type="submit" size="lg" disabled={!documentId || isLoading || isActionPending || Boolean(error)}>
                    {isStarting ? <Spinner /> : <Play aria-hidden="true" />}
                    {isStarting ? "Starting…" : "Start job"}
                </Button>
            </div>
            {!isLoading && error && <p role="alert" className="text-xs text-destructive">{error.message}</p>}
            {!isLoading && !error && !options.length && (
                <p className="text-xs text-muted-foreground">{query.search ? "No matching documents." : "Upload a document to start a processing job."}</p>
            )}
            {(query.page > 1 || totalPages > 1) && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Button type="button" variant="outline" size="xs" disabled={query.page === 1 || isStarting || searchTerm !== query.search} onClick={() => changePage(query.page - 1)}>
                        Previous documents
                    </Button>
                    <span>Page {query.page}</span>
                    <Button type="button" variant="outline" size="xs" disabled={query.page >= totalPages || isLoading || isStarting} onClick={() => changePage(query.page + 1)}>
                        Next documents
                    </Button>
                </div>
            )}
        </form>
    );
}
