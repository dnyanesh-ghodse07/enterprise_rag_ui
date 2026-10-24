import { Sparkles, FileText, Search, Zap, Layers, ArrowUpRight } from "lucide-react";
import { useChat } from "../../context/ChatContext";

const STARTER_PROMPTS = [
    {
        icon: FileText,
        title: "Summarize Documents",
        description: "Provide a concise summary of the key findings across all documents",
        prompt: "Can you provide a concise summary of the main points from the uploaded documents?",
    },
    {
        icon: Search,
        title: "Compare Topics",
        description: "Identify similarities and differences across referenced sources",
        prompt: "What are the common themes and discrepancies across the knowledge base?",
    },
    {
        icon: Zap,
        title: "Action Items & Takeaways",
        description: "Extract actionable steps, deadlines, and requirements",
        prompt: "Extract the primary actionable items and recommendations from our documents.",
    },
    {
        icon: Layers,
        title: "Deep Technical Query",
        description: "Explain architectural patterns and technical implementation details",
        prompt: "Explain the technical design and data structures described in the documentation.",
    },
];

export function ChatWelcome() {
    const { handleChat } = useChat();

    const handleSelectPrompt = (prompt: string) => {
        handleChat(prompt);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[380px] h-full max-w-2xl mx-auto px-4 py-8 text-center animate-in fade-in-50 duration-200">
            {/* Glowing Hero Icon */}
            <div className="relative mb-4">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
                <div className="relative flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-purple-500/10 border border-primary/30 text-primary shadow-xs">
                    <Sparkles className="size-7 sm:size-8 animate-in spin-in-12 duration-500" />
                </div>
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                How can Cognix assist you today?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
                Ask questions, synthesize findings, and explore insights grounded in your uploaded documents and collections.
            </p>

            {/* Quick Starter Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full mt-6 text-left">
                {STARTER_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPrompt(item.prompt)}
                            className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/50 hover:border-primary/40 transition-all duration-200 hover:shadow-xs text-left"
                        >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Icon className="size-3.5" />
                                </div>
                                <ArrowUpRight className="size-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                                    {item.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default ChatWelcome;
