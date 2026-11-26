import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ApiError, apiGet, apiPost, GENERIC_API_ERROR_MESSAGE } from "../api/client";
import type { ChatMessage, ChatResponse, Conversation } from "../types";

interface ChatContextType {
    messages: ChatMessage[];
    question: string;
    setQuestion: (q: string) => void;
    loadingSubmit: boolean;
    loadingConversation: boolean;
    chatError: string | null;
    handleChat: (customQuestion?: string) => void;
    conversationId?: string;
    currentConversation: string;
    handleConversationTitle: (conversation: Conversation | undefined) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { id: conversationId } = useParams();
    const { key: locationKey } = useLocation();
    const navigate = useNavigate();

    const [loadingConversation, setLoadingConversation] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [chatError, setChatError] = useState<{ locationKey: string; message: string } | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState("");
    const isNavigatingFromAskRef = useRef(false);
    const [currentConversation, setCurrentConversation] = useState<string>('New Chat');

    const handleConversationTitle = (conversation: Conversation | undefined) => {
        if (conversation && conversation.title) {
            setCurrentConversation(conversation.title);
        } else {
            setCurrentConversation("New Chat");
        }
    }

    useEffect(() => {
        if (!conversationId) {
            setCurrentConversation("New Chat");
        }
    }, [conversationId]);

    // Fetch conversation messages when conversationId changes
    useEffect(() => {
        if (isNavigatingFromAskRef.current) {
            isNavigatingFromAskRef.current = false;
            return;
        }

        if (conversationId) {
            setLoadingConversation(true);
            apiGet<ChatMessage[]>(`/chat/conversations/${conversationId}`)
                .then((res) => setMessages(res || []))
                .catch(() => setMessages([]))
                .finally(() => setLoadingConversation(false));
        } else {
            setMessages([]);
        }
    }, [conversationId]);

    function handleChat(customQuestion?: string) {
        const textToSend = typeof customQuestion === "string" ? customQuestion : question;
        const trimmed = textToSend.trim();
        if (!trimmed || loadingSubmit) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: trimmed,
        };

        // If starting a fresh chat, optimistically update current conversation title
        if (!conversationId) {
            setCurrentConversation(trimmed.length > 35 ? `${trimmed.slice(0, 35)}...` : trimmed);
        }

        // 1. Optimistic update: show user message instantly & clear input
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");
        setChatError(null);
        setLoadingSubmit(true);

        apiPost<ChatResponse>("/chat/ask", {
            question: trimmed,
            conversation_id: conversationId || null,
            stream: false,
        })
            .then((res) => {
                if (res?.conversation_id && res.conversation_id !== conversationId) {
                    isNavigatingFromAskRef.current = true;
                    navigate(`/chat/conversations/${res.conversation_id}`);
                }
                const assistantMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: res.answer,
                };
                setMessages((prev) => [...prev, assistantMsg]);
            })
            .catch((err: unknown) => {
                console.error("Failed to send message:", err);
                setChatError({
                    locationKey,
                    message: err instanceof ApiError ? err.message : GENERIC_API_ERROR_MESSAGE,
                });
            })
            .finally(() => {
                setLoadingSubmit(false);
            });
    }

    return (
        <ChatContext.Provider
            value={{
                messages,
                question,
                setQuestion,
                loadingSubmit,
                loadingConversation,
                chatError: chatError?.locationKey === locationKey ? chatError.message : null,
                handleChat,
                conversationId,
                currentConversation,
                handleConversationTitle
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
