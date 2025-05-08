import { useState } from 'react';

interface UseTerraConnectReturn {
    initiateConnection: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const useTerraConnect = (): UseTerraConnectReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const initiateConnection = async () => {
        setIsLoading(true);
        setError(null);
        console.log('Hook: Initiating Terra connection...');

        try {
            const response = await fetch('/api/terra/initiate-widget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // No body needed based on current backend endpoint
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response from initiate-widget' }));
                throw new Error(errorData.error || `Server responded with ${response.status} while initiating widget`);
            }

            const { widgetUrl, sessionId } = await response.json();

            if (widgetUrl && sessionId) {
                // Redirect the user to the Terra Widget URL
                console.log(`Hook: Received widgetUrl and sessionId ${sessionId}. Redirecting...`);
                window.location.href = widgetUrl;
                // No need to set isLoading to false here, as the page will navigate away.
            } else {
                throw new Error('Widget URL or Session ID not received from server.');
            }
        } catch (err: any) {
            console.error('Hook: Error initiating Terra connection:', err);
            setError(err.message || 'Failed to initiate Terra connection.');
            setIsLoading(false); // Set loading to false only if an error occurred before redirect
        }
        // Note: setIsLoading(false) is intentionally omitted from the success path 
        // because the redirect should happen.
    };

    return { initiateConnection, isLoading, error };
}; 