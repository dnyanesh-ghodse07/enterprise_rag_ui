
import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";


export interface MarkdownProps {
    content: string;
    className?: string;
}

function CodeBlock({
    language,
    code,
}: {
    language: string;
    code: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy code:", error);
        }
    }

    return (
        <div className="group relative my-4 overflow-hidden rounded-lg border bg-[#282c34] text-sm">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <span className="text-xs text-gray-300">
                    {language || "code"}
                </span>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    aria-label={copied ? "Code copied" : "Copy code"}
                    className="h-7 gap-1.5 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                    {copied ? (
                        <Check className="size-3.5" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                    <span className="text-xs">
                        {copied ? "Copied" : "Copy"}
                    </span>
                </Button>
            </div>

            <SyntaxHighlighter
                language={language || "text"}
                style={oneDark}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                    lineHeight: "1.65",
                    overflowX: "auto",
                }}
                codeTagProps={{
                    style: {
                        fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                    },
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="mb-4 mt-8 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
            {children}
        </h1>
    ),

    h2: ({ children }) => (
        <h2 className="mb-3 mt-8 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            {children}
        </h2>
    ),

    h3: ({ children }) => (
        <h3 className="mb-3 mt-6 text-xl font-semibold tracking-tight">
            {children}
        </h3>
    ),

    h4: ({ children }) => (
        <h4 className="mb-2 mt-5 text-lg font-semibold">
            {children}
        </h4>
    ),

    p: ({ children }) => (
        <p className="my-4 leading-7 [&:not(:first-child)]:mt-4">
            {children}
        </p>
    ),

    a: ({ href, children }) => (
        <a
            href={href}
            className="font-medium text-primary underline underline-offset-4"
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            target={href?.startsWith("http") ? "_blank" : undefined}
        >
            {children}
        </a>
    ),

    ul: ({ children }) => (
        <ul className="my-4 ml-6 list-disc space-y-2">
            {children}
        </ul>
    ),

    ol: ({ children }) => (
        <ol className="my-4 ml-6 list-decimal space-y-2">
            {children}
        </ol>
    ),

    li: ({ children }) => (
        <li className="pl-1 leading-7">{children}</li>
    ),

    blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-2 pl-6 italic text-muted-foreground">
            {children}
        </blockquote>
    ),

    hr: () => <hr className="my-6 border-border" />,

    strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
    ),

    em: ({ children }) => <em className="italic">{children}</em>,

    del: ({ children }) => (
        <del className="text-muted-foreground">{children}</del>
    ),

    img: ({ src, alt }) => (
        <img
            src={src}
            alt={alt ?? ""}
            loading="lazy"
            className="my-6 h-auto max-w-full rounded-lg border"
        />
    ),

    table: ({ children }) => (
        <div className="my-6 w-full overflow-x-auto rounded-md border">
            <table className="w-full text-sm">{children}</table>
        </div>
    ),

    thead: ({ children }) => (
        <thead className="bg-muted">{children}</thead>
    ),

    th: ({ children }) => (
        <th className="border-b px-4 py-3 text-left font-semibold">
            {children}
        </th>
    ),

    td: ({ children }) => (
        <td className="border-b px-4 py-3 align-top">
            {children}
        </td>
    ),

    tr: ({ children }) => (
        <tr className="even:bg-muted/40">{children}</tr>
    ),

    pre: ({ children }) => <>{children}</>,

    code: ({ className, children }) => {
        const match = /language-(\w+)/.exec(className || "");
        const code = String(children).replace(/\n$/, "");

        if (match || code.includes("\n")) {
            return (
                <CodeBlock
                    language={match?.[1] ?? ""}
                    code={code}
                />
            );
        }

        return (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]">
                {children}
            </code>
        );
    },
};

export function Markdown({
    content,
    className = "",
}: MarkdownProps) {
    return (
        <article
            className={`min-w-0 break-words text-sm leading-7 text-foreground ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}

export default Markdown;
