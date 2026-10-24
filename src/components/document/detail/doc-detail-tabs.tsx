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
        icon: React.ReactNode;
        badge?: number;
    }> = [
        {
            key: "preview",
            label: "File Preview",
            icon: <FileText className="size-4" />,
        },
        {
            key: "chunks",
            label: "Knowledge Chunks",
            icon: <Layers className="size-4" />,
            badge: chunksCount,
        },
        {
            key: "versions",
            label: "All Versions",
            icon: <GitBranch className="size-4" />,
            badge: versionsCount,
        },
        {
            key: "metadata",
            label: "Details & Metadata",
            icon: <Info className="size-4" />,
        },
    ];

    return (
        <div className="flex border-b border-border/80 gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                            isActive
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {typeof tab.badge === "number" && tab.badge > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tab.badge}
                            </Badge>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
