import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "../ui/select";
import { Search, X, Filter } from "lucide-react";

interface DocFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCollection: string;
    onCollectionChange: (collection: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    collectionsMap?: { [collectionName: string]: number };
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function DocFilters({
    searchQuery,
    onSearchChange,
    selectedCollection,
    onCollectionChange,
    selectedStatus,
    onStatusChange,
    collectionsMap = {},
    hasActiveFilters,
    onClearFilters,
}: DocFiltersProps) {
    return (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                    type="text"
                    placeholder="Search by title, filename, uploader..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 w-full text-sm h-9"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                        aria-label="Clear search"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {/* Collection Filter */}
                <div className="min-w-[140px] flex-1 sm:flex-initial">
                    <Select value={selectedCollection} onValueChange={(val) => onCollectionChange(val ?? "all")}>
                        <SelectTrigger className="w-full text-xs sm:text-sm h-9">
                            <Filter className="size-3.5 mr-1 text-muted-foreground shrink-0" />
                            <SelectValue placeholder="Collection" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All Collections</SelectItem>
                                <SelectItem value="none">General (No Collection)</SelectItem>
                                {Object.keys(collectionsMap).map((colName) => (
                                    <SelectItem key={colName} value={colName}>
                                        {colName} ({collectionsMap[colName]})
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div className="min-w-[110px] flex-1 sm:flex-initial">
                    <Select value={selectedStatus} onValueChange={(val) => onStatusChange(val ?? "all")}>
                        <SelectTrigger className="w-full text-xs sm:text-sm h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="uploaded">Uploaded</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Filter action */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                    >
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
