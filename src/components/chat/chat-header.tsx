import { useNavigate, useParams } from "react-router";
import { useChat } from "../../context/ChatContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sparkles, PlusCircle, Files } from "lucide-react";

export function ChatHeader() {
    const navigate = useNavigate();
    const { id: conversationId } = useParams();
    const { currentConversation, loadingSubmit } = useChat();

    const title = conversationId ? (currentConversation || "Conversation") : "New Conversation";

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-card/50 backdrop-blur-xs shrink-0">
            {/* Left: Bot info & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Sparkles className="size-4" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-md" title={title}>
                            {title}
                        </h2>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal hidden sm:inline-flex gap-1 items-center">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            RAG Agent
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                        {loadingSubmit ? "Generating response..." : "Grounded with Knowledge Base documents"}
                    </p>
                </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/documents")}
                    className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 h-8"
                    title="View referenced documents"
                >
                    <Files className="size-3.5" />
                    <span>Documents</span>
                </Button>

                {conversationId && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/chat/conversations")}
                        className="text-xs h-8 gap-1.5"
                    >
                        <PlusCircle className="size-3.5" />
                        <span className="hidden sm:inline">New Chat</span>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default ChatHeader;
