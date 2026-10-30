import { Badge } from "../../ui/badge";
import { FileText, Layers, GitBranch, Info } from "lucide-react";

export type DocDetailTabKey = "preview" | "chunks" | "versions" | "metadata";

interface DocDetailTabsProps {
    activeTab: DocDetailTabKey;
    onTabChange: (tab: DocDetailTabKey) => void;
    chunksCount: number;
    versionsCount: number;
}

export default function DocDetailTabs({
    activeTab,
    onTabChange,
    chunksCount,
    versionsCount,
}: DocDetailTabsProps) {
    const tabs: Array<{
        key: DocDetailTabKey;
        label: string;
        shortLabel: string;
        icon: React.ReactNode;
        badge?: number;
    }> = [
        {
            key: "preview",
            label: "File Preview",
            shortLabel: "Preview",
            icon: <FileText className="size-3.5 sm:size-4" />,
        },
        {
            key: "chunks",
            label: "Knowledge Chunks",
            shortLabel: "Chunks",
            icon: <Layers className="size-3.5 sm:size-4" />,
            badge: chunksCount,
        },
        {
            key: "versions",
            label: "All Versions",
            shortLabel: "Versions",
            icon: <GitBranch className="size-3.5 sm:size-4" />,
            badge: versionsCount,
        },
        {
            key: "metadata",
            label: "Details & Metadata",
            shortLabel: "Details",
            icon: <Info className="size-3.5 sm:size-4" />,
        },
    ];

    return (
        <div className="flex border-b border-border/80 gap-0.5 sm:gap-1 overflow-x-auto pb-px scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap shrink-0 ${
                            isActive
                                ? "border-primary text-primary font-semibold"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.shortLabel}</span>
                        {typeof tab.badge === "number" && tab.badge > 0 && (
                            <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4">
                                {tab.badge}
                            </Badge>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
