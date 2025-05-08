import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Assuming react-router-dom v6+ is used
import {
    Box,
    Button,
    Heading,
    Text,
    Spinner,
    Alert,
    AlertIcon,
    Code,
    VStack,
    Container,
} from '@chakra-ui/react';

// Define the structure of the expected data report from the backend
interface HealthDataReport {
    timePeriodDays: number;
    healthData: {
        daily: any[];
        sleep: any[];
        activity: any[];
        body: any[];
    };
    dataAvailabilityNotes: string[];
}

export const TerraDataViewerPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');
    const [error, setError] = useState<string | null>(null);
    const [dataReport, setDataReport] = useState<HealthDataReport | null>(null);
    const [sessionIdFromUrl, setSessionIdFromUrl] = useState<string | null>(null);

    useEffect(() => {
        const sessionId = searchParams.get('sessionId');
        const terraUserIdFromRedirect = searchParams.get('user_id'); // Terra sends 'user_id'
        const authError = searchParams.get('error');

        if (authError) {
            setError(`Authentication with Terra failed: ${authError}. Please try again.`);
            setIsLoading(false);
            return;
        }

        if (sessionId) {
            setSessionIdFromUrl(sessionId);
            if (terraUserIdFromRedirect) {
                // New step: Confirm auth with backend using details from URL
                setLoadingMessage('Confirming authentication...');
                setIsLoading(true);
                fetch('/api/terra/confirm-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, terraUserIdFromUrl: terraUserIdFromRedirect }),
                })
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: 'Failed to parse confirm-auth error' }));
                        throw new Error(errorData.error || `Confirm auth failed: ${res.status}`);
                    }
                    return res.json(); 
                })
                .then(() => {
                    // Auth confirmed, now fetch the data report
                    setLoadingMessage('Fetching health data report...');
                    return fetch(`/api/terra/data-report/${sessionId}`);
                })
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: 'Failed to parse data-report error' }));
                        throw new Error(errorData.error || `Data report fetch failed: ${res.status}`);
                    }
                    return res.json();
                })
                .then((report: HealthDataReport) => {
                    setDataReport(report);
                    setError(null);
                })
                .catch((err) => {
                    console.error('Error in auth confirmation or data report fetching:', err);
                    setError(err.message || 'An unknown error occurred.');
                    setDataReport(null);
                })
                .finally(() => {
                    setIsLoading(false);
                    setLoadingMessage('Loading...');
                });
            } else if (!dataReport) {
                 // Session ID is in URL, but no terraUserId (maybe came here not from Terra redirect)
                 // or no dataReport yet, and not an authError. Could be a stale link or user navigated here directly.
                 // We could try to fetch the report if we assume auth might have happened via webhook earlier,
                 // but for this explicit test page, if user_id isn't from redirect, it implies an incomplete flow.
                 // For now, we won't auto-fetch if terraUserIdFromRedirect is missing.
                 // We could show a message or let the user click the button again.
                 console.log('Session ID found in URL, but not Terra User ID. User might need to connect.');
            }
        }
    }, [searchParams]); // Removed dataReport from dependency array to avoid re-triggering on setDataReport

    const handleConnectTerra = async () => {
        setIsLoading(true);
        setError(null);
        setDataReport(null);
        setSessionIdFromUrl(null);
        try {
            const response = await fetch('/api/terra/initiate-widget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify({}), // No body needed for this endpoint based on backend
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
                throw new Error(errorData.error || `Server responded with ${response.status} while initiating widget`);
            }
            const { widgetUrl, sessionId } = await response.json();
            if (widgetUrl && sessionId) {
                // The backend will set up the redirect URL to come back here with the sessionId
                window.location.href = widgetUrl;
            } else {
                throw new Error('Widget URL or Session ID not received from server.');
            }
        } catch (err: any) {
            console.error('Error initiating Terra connection:', err);
            setError(err.message || 'Failed to initiate Terra connection.');
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={6} align="stretch">
                <Heading as="h1" size="xl" textAlign="center">
                    Terra Health Data Viewer (Test Page)
                </Heading>

                {!sessionIdFromUrl && !dataReport && (
                    <Button 
                        colorScheme="teal" 
                        onClick={handleConnectTerra} 
                        isLoading={isLoading} 
                        loadingText={loadingMessage}
                        size="lg"
                        alignSelf="center"
                    >
                        Connect to Terra & Fetch Data
                    </Button>
                )}

                {isLoading && (
                    <Box textAlign="center">
                        <Spinner size="xl" />
                        <Text mt={2}>{loadingMessage}</Text>
                    </Box>
                )}

                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}

                {dataReport && (
                    <Box borderWidth="1px" borderRadius="lg" p={6} overflowX="auto">
                        <Heading as="h2" size="lg" mb={4}>Fetched Health Data Report</Heading>
                        <Code as="pre" p={4} borderRadius="md" whiteSpace="pre-wrap" wordBreak="break-all">
                            {JSON.stringify(dataReport, null, 2)}
                        </Code>
                    </Box>
                )}
                 {sessionIdFromUrl && !isLoading && !dataReport && !error && (
                    <Text textAlign="center">
                        Session active: {sessionIdFromUrl}. 
                        {searchParams.get('user_id') ? 'Awaiting data...' : 'Ready to connect or waiting for redirect.'}
                    </Text>
                )}

            </VStack>
        </Container>
    );
}; 