import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { bytesToMB, formatDate } from "../../../utils";
import type { Document, DocumentVersion } from "../../../types/document.types";
import { GitBranch, Download, UploadCloud } from "lucide-react";

interface DocVersionsTabProps {
    doc: Document;
    versions: DocumentVersion[];
    onUploadNewVersion: () => void;
    onDownloadVersion: (versionNumber: number) => void;
}

export default function DocVersionsTab({
    doc,
    versions,
    onUploadNewVersion,
    onDownloadVersion,
}: DocVersionsTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                    <h2 className="text-sm font-semibold">Document Version History</h2>
                    <p className="text-xs text-muted-foreground">
                        Track all revisions uploaded to this knowledge source
                    </p>
                </div>
                <Button size="sm" onClick={onUploadNewVersion} className="w-full sm:w-auto justify-center">
                    <UploadCloud className="size-3.5 mr-1.5" />
                    Upload New Version
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {versions.map((ver) => {
                    const isCurrent = ver.version_number === doc.current_version;
                    return (
                        <Card 
                            key={ver.id} 
                            className={`p-3 sm:p-4 border-border/80 transition-all ${
                                isCurrent ? "ring-1 ring-primary/40 bg-primary/5" : "bg-card"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                        <GitBranch className="size-4" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs sm:text-sm font-bold">
                                                Version {ver.version_number}
                                            </span>
                                            {isCurrent && (
                                                <Badge variant="success" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                                                    Current Version
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground/80 break-words">
                                            {ver.change_note || "Initial version upload"}
                                        </p>
                                        <div className="flex items-center gap-2 sm:gap-3 pt-0.5 text-[10px] sm:text-[11px] text-muted-foreground flex-wrap">
                                            <span>Size: {bytesToMB(ver.file_size)}</span>
                                            <span>•</span>
                                            <span>Uploaded: {formatDate(ver.created_at)}</span>
                                            {ver.checksum && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono text-[9px] sm:text-[10px] truncate max-w-[100px] sm:max-w-[120px]">
                                                        SHA: {ver.checksum.slice(0, 10)}...
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDownloadVersion(ver.version_number)}
                                    className="text-xs shrink-0 w-full sm:w-auto justify-center h-8"
                                >
                                    <Download className="size-3.5 mr-1.5" />
                                    Download v{ver.version_number}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
