import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { bytesToMB } from "../../lib/formatters";
import type { DocStats as DocStatsType } from "../../types/document.types";
import { Files, HardDrive, CheckCircle2, AlertCircle, Folder } from "lucide-react";

interface DocStatsProps {
    stats: DocStatsType | null;
    isLoading?: boolean;
}

export default function DocStats({ stats, isLoading = false }: DocStatsProps) {
    const showSkeleton = isLoading && !stats;

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {/* Total Documents */}
            <Card className="p-4 border-border/80 shadow-2xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Documents</span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Files className="size-4" />
                    </div>
                </div>
                <div className="mt-2">
                    {showSkeleton ? (
                        <Skeleton className="h-7 w-16" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            {stats?.total ?? 0}
                        </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Active knowledge sources
                    </p>
                </div>
            </Card>

            {/* Storage Consumed */}
            <Card className="p-4 border-border/80 shadow-2xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Storage Used</span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <HardDrive className="size-4" />
                    </div>
                </div>
                <div className="mt-2">
                    {showSkeleton ? (
                        <Skeleton className="h-7 w-20" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            {bytesToMB(stats?.storage ?? 0)}
                        </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Indexed content storage
                    </p>
                </div>
            </Card>

            {/* Ingestion Status */}
            <Card className="p-4 border-border/80 shadow-2xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Status Breakdown</span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="size-4" />
                    </div>
                </div>
                <div className="mt-2">
                    {showSkeleton ? (
                        <Skeleton className="h-7 w-24" />
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="success" className="text-xs px-2 py-0.5">
                                <CheckCircle2 className="size-3 mr-1" />
                                {stats?.count_by_status?.ready ?? 0} Ready
                            </Badge>
                            {(stats?.count_by_status?.error ?? 0) > 0 && (
                                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                    <AlertCircle className="size-3 mr-1" />
                                    {stats?.count_by_status?.error} Error
                                </Badge>
                            )}
                        </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Ingestion health status
                    </p>
                </div>
            </Card>

            {/* Collections Breakdown */}
            <Card className="p-4 border-border/80 shadow-2xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Collections</span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                        <Folder className="size-4" />
                    </div>
                </div>
                <div className="mt-2">
                    {showSkeleton ? (
                        <Skeleton className="h-7 w-16" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            {Object.keys(stats?.count_by_collection ?? {}).length}
                        </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar">
                        {Object.keys(stats?.count_by_collection ?? {}).length > 0 ? (
                            Object.keys(stats?.count_by_collection ?? {}).slice(0, 2).map((key) => (
                                <Badge key={key} variant="secondary" className="text-[10px] px-1.5 py-0 truncate max-w-[100px]">
                                    {key} ({stats?.count_by_collection[key]})
                                </Badge>
                            ))
                        ) : (
                            <span className="text-[11px] text-muted-foreground">No custom collections</span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
