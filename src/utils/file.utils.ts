/**
 * Resolves a relative or absolute backend URL to a fully qualified URL
 */
export function resolveBackendFileUrl(urlPath: string): string {
    if (!urlPath) return "";
    if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
        return urlPath;
    }
    const backendBase = import.meta.env.VITE_API_URL 
        ? new URL(import.meta.env.VITE_API_URL).origin 
        : "http://localhost:8000";
    return `${backendBase}${urlPath}`;
}

/**
 * Downloads a file from a URL using authenticated fetch and creates a temporary blob download link
 */
export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
    const fullUrl = resolveBackendFileUrl(url);
    const token = localStorage.getItem("access_token");

    const response = await fetch(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText || response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "document";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
}

/**
 * Returns boolean flags indicating the type category of a file based on filename and MIME type
 */
export function getFileTypeFlags(filename: string = "", mimeType: string = "") {
    const lowerName = filename.toLowerCase();
    const lowerMime = mimeType.toLowerCase();

    const isMarkdown = lowerName.endsWith(".md") || lowerMime.includes("markdown");
    const isText = 
        lowerMime.includes("text") || 
        lowerName.endsWith(".txt") || 
        lowerName.endsWith(".csv") || 
        lowerName.endsWith(".log");
    const isJson = lowerMime.includes("json") || lowerName.endsWith(".json");
    const isPdf = lowerMime.includes("pdf") || lowerName.endsWith(".pdf");
    const isImage = lowerMime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(lowerName);

    return {
        isMarkdown,
        isText,
        isJson,
        isPdf,
        isImage,
        isPreviewable: isMarkdown || isText || isJson || isPdf || isImage,
    };
}

/**
 * Copies a given text string to the system clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        return false;
    }
}
