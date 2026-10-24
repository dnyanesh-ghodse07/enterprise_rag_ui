import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { apiGet, apiPost } from "../api/client";
import type { ChatMessage, Conversation } from "../types";

interface ChatContextType {
    messages: ChatMessage[];
    question: string;
    setQuestion: (q: string) => void;
    loadingSubmit: boolean;
    loadingConversation: boolean;
    handleChat: (customQuestion?: string) => void;
    conversationId?: string;
    currentConversation: string;
    handleConversationTitle: (conversation: Conversation | undefined) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { id: conversationId } = useParams();
    const navigate = useNavigate();

    const [loadingConversation, setLoadingConversation] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
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
        setLoadingSubmit(true);

        apiPost("/chat/ask", {
            question: trimmed,
            conversation_id: conversationId || null,
            stream: false,
        })
            .then((res: any) => {
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
            .catch((err) => {
                console.error("Failed to send message:", err);
                const errorMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, I encountered an issue processing your request. Please check the network connection and try again.",
                };
                setMessages((prev) => [...prev, errorMsg]);
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
