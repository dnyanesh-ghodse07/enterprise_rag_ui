import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/button";

interface ThemeToggleProps {
    variant?: "outline" | "ghost" | "secondary";
    size?: "icon" | "icon-sm" | "icon-xs" | "default" | "sm";
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({
    variant = "outline",
    size = "icon-sm",
    className = "",
    showLabel = false,
}: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`relative overflow-hidden transition-all duration-200 cursor-pointer ${className}`}
        >
            <div className="relative flex items-center justify-center">
                <Sun
                    className={`size-4 transition-all duration-300 transform ${
                        isDark
                            ? "rotate-0 scale-100 text-amber-400"
                            : "-rotate-90 scale-0 text-muted-foreground absolute"
                    }`}
                />
                <Moon
                    className={`size-4 transition-all duration-300 transform ${
                        isDark
                            ? "rotate-90 scale-0 text-muted-foreground absolute"
                            : "rotate-0 scale-100 text-slate-700"
                    }`}
                />
            </div>
            {showLabel && (
                <span className="ml-2 text-xs font-medium">
                    {isDark ? "Light mode" : "Dark mode"}
                </span>
            )}
        </Button>
    );
}

export function ThemeSegmentedControl({ className = "" }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: "light" as const, label: "Light", icon: Sun },
        { value: "dark" as const, label: "Dark", icon: Moon },
        { value: "system" as const, label: "System", icon: Monitor },
    ];

    return (
        <div
            className={`flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 ${className}`}
            role="radiogroup"
            aria-label="Theme selection"
        >
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setTheme(opt.value)}
                        className={`flex items-center justify-center gap-1.5 flex-1 py-1 px-2 text-[11px] font-medium rounded-md transition-all duration-150 cursor-pointer ${
                            isActive
                                ? "bg-background text-foreground shadow-xs font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                        }`}
                        title={`${opt.label} mode`}
                    >
                        <Icon className="size-3 shrink-0" />
                        <span>{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default ThemeToggle;
