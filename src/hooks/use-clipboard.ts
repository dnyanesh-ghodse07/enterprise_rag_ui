import { useState, useCallback } from "react";
import { copyTextToClipboard } from "../utils/file.utils";

export function useClipboard(timeout = 2000) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copy = useCallback(async (text: string, id: string = "default") => {
        const success = await copyTextToClipboard(text);
        if (success) {
            setCopiedId(id);
            setTimeout(() => {
                setCopiedId((current) => (current === id ? null : current));
            }, timeout);
        }
        return success;
    }, [timeout]);

    return {
        copiedId,
        isCopied: (id: string = "default") => copiedId === id,
        copy,
    };
}
