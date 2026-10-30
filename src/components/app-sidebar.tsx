import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    useSidebar,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { apiGet, getCurrentUser } from "../api/client";
import type { Conversation, User } from "../types";
import ListItemSkelton from "./skeletons/ListItem.skeleton";
import DeleteConversationDialog from "./chat/delete-conversation-dialog";
import {
    Sparkles,
    Plus,
    MessageSquare,
    Files,
    Trash2,
    User2,
} from "lucide-react";

export function AppSidebar() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setOpenMobile, isMobile } = useSidebar();

    const [history, setHistory] = useState<Conversation[]>([]);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const cached = localStorage.getItem("current_user");
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        getCurrentUser()
            .then((user) => {
                setCurrentUser(user);
                try {
                    localStorage.setItem("current_user", JSON.stringify(user));
                } catch {
                    // ignore storage error
                }
            })
            .catch((err) => {
                console.error("Failed to load current user in sidebar:", err);
            });
    }, []);

    const fetchHistory = () => {
        setLoadingConversation(true);
        apiGet<Conversation[]>("/chat/conversations?limit=100")
            .then((res) => {
                setHistory(res || []);
            })
            .catch((err) => {
                console.error("Failed to load chat history", err);
            })
            .finally(() => {
                setLoadingConversation(false);
            });
    };

    useEffect(() => {
        fetchHistory();
    }, [id]);

    const handleNewChat = () => {
        if (isMobile) setOpenMobile(false);
        navigate(`/chat/conversations`);
    };

    const handleConversationClick = (conversation: Conversation) => {
        if (isMobile) setOpenMobile(false);
        navigate(`/chat/conversations/${conversation.id}`);
    };

    const handleDeleteSuccess = (deletedId: string) => {
        setHistory((prev) => prev.filter((c) => c.id !== deletedId));
        if (id === deletedId) {
            navigate("/chat/conversations");
        }
    };

    const isDocumentsActive = location.pathname.startsWith("/documents");
    const isChatActive = location.pathname.startsWith("/chat");

    return (
        <Sidebar className="border-r border-border/80 bg-sidebar">
            {/* Header / Brand */}
            <SidebarHeader className="p-3.5 border-b border-sidebar-border/60">
                <div className="flex items-center gap-2.5 px-1">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 text-primary-foreground shadow-xs">
                        <Sparkles className="size-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold tracking-tight text-sidebar-foreground truncate">
                            Cognix
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">
                            AI Knowledge Base
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            {/* Navigation & Chats */}
            <SidebarContent className="flex-1 min-h-0 overflow-hidden px-2 py-3 space-y-3">
                {/* Main Action: New Chat */}
                <div className="px-1">
                    <Button
                        onClick={handleNewChat}
                        size="sm"
                        className="w-full justify-center gap-2 h-9 text-xs font-semibold shadow-xs"
                    >
                        <Plus className="size-4" />
                        <span>New Chat</span>
                    </Button>
                </div>

                {/* Primary Nav Links */}
                <SidebarGroup className="p-0 space-y-1">
                    <Button
                        variant={isChatActive && !id ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            if (isMobile) setOpenMobile(false);
                            navigate("/chat/conversations");
                        }}
                        className={`w-full justify-start text-xs h-8.5 font-medium px-2.5 ${isChatActive && !id ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <MessageSquare className="size-4 mr-2 shrink-0 text-primary" />
                        <span className="truncate">Assistant</span>
                    </Button>

                    <Button
                        variant={isDocumentsActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            if (isMobile) setOpenMobile(false);
                            navigate("/documents");
                        }}
                        className={`w-full justify-start text-xs h-8.5 font-medium px-2.5 ${isDocumentsActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Files className="size-4 mr-2 shrink-0 text-purple-500" />
                        <span className="truncate">Documents & Collections</span>
                    </Button>
                </SidebarGroup>

                <Separator className="my-1 opacity-60" />

                {/* Chat History Group */}
                <SidebarGroup className="flex-1 min-h-0 py-0 flex flex-col">
                    <div className="flex items-center justify-between px-2 pb-1.5 pt-0.5">
                        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Chat History
                        </span>
                        {history.length > 0 && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                                {history.length}
                            </Badge>
                        )}
                    </div>

                    <ScrollArea className="flex-1 h-full w-full">
                        <div className="flex flex-col gap-1 pr-2 py-1">
                            {loadingConversation ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <ListItemSkelton key={index} />
                                ))
                            ) : history.length === 0 ? (
                                <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        No conversations yet. Start a new chat to ask questions!
                                    </p>
                                </div>
                            ) : (
                                history.map((conversation) => {
                                    const isActive = conversation.id === id;
                                    return (
                                        <div
                                            key={conversation.id}
                                            className={`group relative flex items-center justify-between w-full rounded-lg transition-colors text-xs ${isActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleConversationClick(conversation)}
                                                className="flex-1 text-left px-2.5 py-2 truncate flex items-center gap-2 min-w-0"
                                                title={conversation.title || "New Chat"}
                                            >
                                                <MessageSquare className={`size-3.5 shrink-0 ${isActive ? "text-primary" : "opacity-60"}`} />
                                                <span className="truncate">
                                                    {conversation.title || "New Chat"}
                                                </span>
                                            </button>

                                            {/* Delete Option on Hover */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConversationToDelete(conversation);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 mr-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                                                title="Delete conversation"
                                                aria-label="Delete conversation"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer / User Profile & Logout */}
            <SidebarFooter className="p-3 border-t border-sidebar-border/60 space-y-2">
                {currentUser?.id && (
                    <div className="flex items-center gap-2.5 px-1 py-1 rounded-lg">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <User2 className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-medium text-sidebar-foreground truncate" title={currentUser.full_name}>
                                {currentUser.full_name || "User"}
                            </span>
                            {currentUser.role && (
                                <span className="text-[10px] text-muted-foreground capitalize">
                                    {currentUser.role}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </SidebarFooter>

            {/* Delete Conversation Confirmation Dialog */}
            <DeleteConversationDialog
                conversation={conversationToDelete}
                isOpen={Boolean(conversationToDelete)}
                onClose={() => setConversationToDelete(null)}
                onSuccess={handleDeleteSuccess}
            />
        </Sidebar>
    );
}

export default AppSidebar;