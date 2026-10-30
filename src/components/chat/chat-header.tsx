import { useNavigate, useParams } from "react-router";
import { useChat } from "../../context/ChatContext";
import { Button } from "../ui/button";
import { PlusCircle, Files } from "lucide-react";

export function ChatHeader() {
    const navigate = useNavigate();
    const { id: conversationId } = useParams();

    const { currentConversation } = useChat();

    return (
        <div className="flex sm:hidden items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-border/70 bg-card/50 backdrop-blur-xs shrink-0">
            <h2 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[130px] xs:max-w-[200px] sm:max-w-md" title={currentConversation}>
                {currentConversation}
            </h2>
            {/* Right: Quick Actions */}
            <div className="items-center gap-1.5 sm:gap-2 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/documents")}
                    className="text-xs text-muted-foreground hover:text-foreground items-center gap-1.5 h-8"
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
                        className="text-xs h-7 sm:h-8 px-2 sm:px-2.5 gap-1 shrink-0"
                        title="New Chat"
                    >
                        <PlusCircle className="size-3.5" />
                        <span className="hidden xs:inline">New Chat</span>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default ChatHeader;
