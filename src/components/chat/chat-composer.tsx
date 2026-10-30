import { useRef, useEffect } from "react";
import { ArrowUp, X, FileSearch } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useChat } from "../../context/ChatContext";

export function ChatComposer() {
    const { handleChat, loadingSubmit, question, setQuestion } = useChat();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-grow textarea height to fit content up to 160px
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 160);
        textarea.style.height = `${Math.max(newHeight, 44)}px`;
    }, [question]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (question.trim() && !loadingSubmit) {
                handleChat();
            }
        }
    };

    const handleClear = () => {
        setQuestion("");
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const canSubmit = Boolean(question.trim()) && !loadingSubmit;

    return (
        <div className="w-full max-w-3xl mx-auto px-2.5 sm:px-4 pb-2 sm:pb-4 pt-1 shrink-0">
            <div className="relative rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
                {/* Input Textarea Area */}
                <div className="flex items-end gap-1.5 sm:gap-2 p-2 sm:p-3">
                    <textarea
                        ref={textareaRef}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Cognix about your documents, summarize content..."
                        rows={1}
                        disabled={loadingSubmit}
                        className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 resize-none outline-none leading-relaxed min-h-[40px] sm:min-h-[44px] max-h-[140px] sm:max-h-[160px] py-1 px-1"
                    />

                    {/* Clear Button */}
                    {question && !loadingSubmit && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 mb-0.5"
                            title="Clear input"
                            aria-label="Clear input"
                        >
                            <X className="size-4" />
                        </button>
                    )}

                    {/* Send Button */}
                    <Button
                        type="button"
                        onClick={() => handleChat()}
                        disabled={!canSubmit}
                        size="sm"
                        className={`size-8 sm:size-9 rounded-lg sm:rounded-xl p-0 shrink-0 transition-all shadow-xs mb-0.5 ${
                            canSubmit
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
                                : "opacity-40 cursor-not-allowed"
                        }`}
                        aria-label="Send message"
                    >
                        {loadingSubmit ? (
                            <Spinner className="size-3.5 sm:size-4" />
                        ) : (
                            <ArrowUp className="size-4 stroke-[2.5]" />
                        )}
                    </Button>
                </div>

                {/* Bottom Context & Hints Bar */}
                <div className="flex items-center justify-between px-2.5 sm:px-3.5 py-1 sm:py-1.5 border-t border-border/40 bg-muted/30 text-[10px] sm:text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground/75 truncate">
                        <FileSearch className="size-3 text-primary shrink-0" />
                        <span className="truncate">Grounded in Knowledge Base</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/70 shrink-0">
                        <span>Enter ↵ to send</span>
                        <span>·</span>
                        <span>Shift + Enter for newline</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatComposer;
