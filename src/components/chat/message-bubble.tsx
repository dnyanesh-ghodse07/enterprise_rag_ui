import { useState } from "react";
import { Copy, Check, ThumbsUp, ThumbsDown, User, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Markdown } from "../ui/markdown";
import type { ChatMessage } from "../../types";

export function MessageUser({ message }: { message: ChatMessage }) {
    return (
        <div className="flex items-start justify-end gap-2.5 my-3 animate-in fade-in-50 duration-150">
            <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] min-w-0">
                <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2.5 shadow-xs text-sm leading-relaxed wrap-break-word">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
            </div>
            <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/80 text-foreground/80 mt-0.5">
                <User className="size-4" />
            </div>
        </div>
    );
}

export function MessageAI({ message }: { message: ChatMessage }) {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy message:", err);
        }
    };

    const handleFeedback = (type: "like" | "dislike") => {
        setFeedback((prev) => (prev === type ? null : type));
    };

    return (
        <div className="flex items-start gap-2.5 my-4 animate-in fade-in-50 duration-150">
            {/* Assistant Avatar */}
            <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 border border-primary/30 text-primary mt-0.5 shadow-xs">
                <Sparkles className="size-4" />
            </div>

            {/* Content Container */}
            <div className="flex flex-col flex-1 min-w-0 max-w-[95%] sm:max-w-[88%]">
                {/* Header label */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-foreground">Cognix</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-normal">
                        Assistant
                    </Badge>
                </div>

                {/* Message Body with Markdown */}
                <div className="rounded-2xl rounded-tl-xs bg-card border border-border/80 p-4 shadow-xs text-sm text-foreground overflow-hidden">
                    <Markdown content={message.content} />
                </div>

                {/* Interactive Action Bar */}
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        title={copied ? "Copied to clipboard" : "Copy response"}
                        aria-label="Copy response"
                    >
                        {copied ? (
                            <>
                                <Check className="size-3.5 text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="size-3.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback("like")}
                        className={`size-7 p-0 ${
                            feedback === "like" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Helpful"
                        aria-label="Helpful"
                    >
                        <ThumbsUp className="size-3.5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback("dislike")}
                        className={`size-7 p-0 ${
                            feedback === "dislike" ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Unhelpful"
                        aria-label="Unhelpful"
                    >
                        <ThumbsDown className="size-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}