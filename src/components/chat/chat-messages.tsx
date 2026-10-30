import { useEffect, useRef, useState } from "react";
import MessageSkeloton from "../skeletons/Message.skeleton";
import { MessageAI, MessageUser } from "./message-bubble";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useChat } from "../../context/ChatContext";
import { Sparkles, ArrowDown } from "lucide-react";

export function ChatMessages() {
    const { loadingConversation, loadingSubmit, messages } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Auto-scroll when new messages arrive or loading states change
    useEffect(() => {
        scrollToBottom("smooth");
    }, [messages, loadingSubmit, loadingConversation]);

    // Track scroll position to show/hide "Scroll to bottom" button
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
        setShowScrollBottom(distanceFromBottom > 150);
    };

    return (
        <div className="relative flex-1 min-h-0 w-full overflow-hidden">
            <ScrollArea
                className="h-full w-full"
                onScrollCapture={handleScroll}
            >
                <div className="flex flex-col p-2.5 sm:p-6 max-w-3xl mx-auto min-h-full">
                    {loadingConversation ? (
                        <div className="py-6 space-y-4">
                            <MessageSkeloton count={6} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-muted-foreground">
                            <p className="text-sm">No messages in this conversation yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-1">
                            {messages.map((message) =>
                                message.role === "user" ? (
                                    <MessageUser key={message.id} message={message} />
                                ) : (
                                    <MessageAI key={message.id} message={message} />
                                )
                            )}

                            {/* Thinking / Streaming Indicator */}
                            {loadingSubmit && (
                                <div className="flex items-start gap-2 sm:gap-2.5 my-2.5 sm:my-3 animate-in fade-in-50 duration-200">
                                    <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary mt-0.5">
                                        <Sparkles className="size-3.5 sm:size-4 animate-spin" />
                                    </div>
                                    <div className="rounded-2xl rounded-tl-xs bg-muted/60 border border-border/60 px-3 py-2 sm:px-4 sm:py-3 shadow-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                                <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                                            </div>
                                            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                                                Cognix is researching documents and generating response...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-2" />
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Floating Scroll to Bottom button */}
            {showScrollBottom && (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-6 animate-in fade-in-50 duration-200 z-10">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => scrollToBottom("smooth")}
                        className="rounded-full shadow-md size-8 sm:size-9 p-0 bg-background/90 backdrop-blur-xs border border-border"
                        aria-label="Scroll to bottom"
                    >
                        <ArrowDown className="size-3.5 sm:size-4 text-foreground" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ChatMessages;
