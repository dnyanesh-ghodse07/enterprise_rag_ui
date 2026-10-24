import { useChat, ChatProvider } from "../context/ChatContext";
import { 
    ChatHeader, 
    ChatWelcome, 
    ChatMessages, 
    ChatComposer 
} from "../components/chat";

function ChatPageContent() {
    const { conversationId, messages, loadingConversation, loadingSubmit } = useChat();

    // Show welcome screen ONLY if there are no messages and no submission/conversation in flight
    const showWelcome = !conversationId && messages.length === 0 && !loadingSubmit && !loadingConversation;

    return (
        <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-background">
            {/* Modular Chat Header */}
            <ChatHeader />

            {/* Central Area: Welcome Prompts OR Messages Stream */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {showWelcome ? (
                    <div className="flex-1 overflow-y-auto">
                        <ChatWelcome />
                    </div>
                ) : (
                    <ChatMessages />
                )}
            </div>

            {/* Floating Composer at Bottom */}
            <ChatComposer />
        </div>
    );
}

export default function ChatPage() {
    return (
        <ChatProvider>
            <ChatPageContent />
        </ChatProvider>
    );
}
