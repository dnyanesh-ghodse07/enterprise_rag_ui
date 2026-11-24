import { useEffect, useState } from "react";
import { apiGet } from "../api/client";

interface RequestResult<T> {
    endpoint: string;
    refreshVersion: number;
    data: T | null;
    error: Error | null;
}

export function useApiGet<T>(endpoint: string | null, refreshVersion = 0) {
    const [result, setResult] = useState<RequestResult<T> | null>(null);
    const current = result?.endpoint === endpoint ? result : null;
    const isLoading = endpoint !== null && current?.refreshVersion !== refreshVersion;

    useEffect(() => {
        if (endpoint === null) return;
        let ignore = false;

        apiGet<T>(endpoint)
            .then((data) => {
                if (ignore) return;
                setResult({ endpoint, refreshVersion, data, error: null });
            })
            .catch((error: unknown) => {
                if (ignore) return;
                console.error(`Failed to load ${endpoint}`, error);
                setResult((previous) => ({
                    endpoint,
                    refreshVersion,
                    data: previous?.endpoint === endpoint ? previous.data : null,
                    error: error instanceof Error ? error : new Error("Request failed"),
                }));
            });

        return () => {
            ignore = true;
        };
    }, [endpoint, refreshVersion]);

    const updateData = (data: T) => {
        setResult((previous) => previous?.endpoint === endpoint ? { ...previous, data, error: null } : previous);
    };

    return {
        data: current?.data ?? null,
        error: isLoading ? null : current?.error ?? null,
        isLoading,
        updateData,
        clearError: () => setResult((previous) => previous?.error ? { ...previous, error: null } : previous),
    };
}
