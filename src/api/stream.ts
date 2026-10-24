/**
 * SSE streaming client for chat responses.
 * 
 * THIS IS THE MAGIC THAT MAKES TOKENS APPEAR IN REAL-TIME.
 * 
 * HOW IT WORKS:
 * 1. We make a POST request with stream: true
 * 2. The response body is a ReadableStream
 * 3. We read chunks as they arrive
 * 4. Each chunk contains SSE events ("data: {...}\n\n")
 * 5. We parse each event and call the appropriate callback
 * 
 * WHY NOT EventSource:
 * The native EventSource API only supports GET requests.
 * We need POST (to send the question body).
 * So we use fetch() with ReadableStream instead.
 */

import type { StreamEvent, SourceReference } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface StreamCallbacks {
    onPlan?: (queryType: string, rewrittenQuery: string) => void;
    onSources?: (sources: SourceReference[]) => void;
    onToken?: (token: string) => void;
    onDone?: (conversationId: string) => void;
    onError?: (error: string) => void;
}

/**
 * Stream a chat response from the backend.
 * 
 * Returns an AbortController so the caller can cancel the stream.
 */
export function streamChat(
    question: string,
    callbacks: StreamCallbacks,
    conversationId?: string,
    documentIds?: string[],
): AbortController {
    const controller = new AbortController();
    const token = localStorage.getItem('access_token');

    // Start streaming in the background
    (async () => {
        try {
            const response = await fetch(`${API_BASE}/chat/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question,
                    stream: true,
                    conversation_id: conversationId,
                    document_ids: documentIds,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                callbacks.onError?.(err.detail || `HTTP ${response.status}`);
                return;
            }

            // Read the stream
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE events (separated by \n\n)
                const events = buffer.split('\n\n');
                buffer = events.pop() || ''; // Keep incomplete event in buffer

                for (const eventText of events) {
                    const lines = eventText.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6); // Remove "data: " prefix

                            if (jsonStr === '[DONE]') {
                                continue;
                            }

                            try {
                                const event: StreamEvent = JSON.parse(jsonStr);

                                switch (event.type) {
                                    case 'plan':
                                        callbacks.onPlan?.(event.query_type, event.rewritten_query);
                                        break;
                                    case 'sources':
                                        callbacks.onSources?.(event.sources);
                                        break;
                                    case 'token':
                                        callbacks.onToken?.(event.content);
                                        break;
                                    case 'done':
                                        callbacks.onDone?.(event.conversation_id);
                                        break;
                                    case 'error':
                                        callbacks.onError?.(event.message);
                                        break;
                                }
                            } catch {
                                // Skip malformed JSON
                            }
                        }
                    }
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                callbacks.onError?.(err.message || 'Stream failed');
            }
        }
    })();

    return controller;
}
