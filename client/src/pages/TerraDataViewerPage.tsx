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
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Flex,
} from '@chakra-ui/react';
import Navbar from '../components/Navbar';

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

// Structure of the Archetype data from backend (matches LLMArchetypeResponse)
interface ArchetypeResult {
    archetypeName: string;
    archetypeDescription: string;
    imagePrompt: string;
    sliderValues: {
        recoveryReadiness: number;
        activityLoad: number;
        sleepStability: number;
        heartRhythmBalance: number;
        consistency: number;
    };
    imageDataUrl?: string;
}

export const TerraDataViewerPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [isGeneratingArchetype, setIsGeneratingArchetype] = useState<boolean>(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');
    const [error, setError] = useState<string | null>(null);
    const [archetypeError, setArchetypeError] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [dataReport, setDataReport] = useState<HealthDataReport | null>(null);
    const [archetypeResult, setArchetypeResult] = useState<ArchetypeResult | null>(null);
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [sessionIdFromUrl, setSessionIdFromUrl] = useState<string | null>(null);

    useEffect(() => {
        const sessionId = searchParams.get('sessionId');
        const terraUserIdFromRedirect = searchParams.get('user_id'); // Terra sends 'user_id'
        const authError = searchParams.get('error');

        if (authError) {
            setError(`Authentication with Terra failed: ${authError}. Please try again.`);
            setIsLoadingData(false);
            return;
        }

        if (sessionId) {
            setSessionIdFromUrl(sessionId);
            if (terraUserIdFromRedirect) {
                // New step: Confirm auth with backend using details from URL
                setLoadingMessage('Confirming authentication...');
                setIsLoadingData(true);
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
                    setIsLoadingData(false);
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
        setIsLoadingData(true);
        setError(null);
        setArchetypeError(null);
        setImageError(null);
        setDataReport(null);
        setArchetypeResult(null);
        setImageDataUrl(null);
        setSessionIdFromUrl(null);
        try {
            const response = await fetch('/api/terra/initiate-widget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            setIsLoadingData(false);
        }
    };

    const handleGenerateArchetype = async () => {
        if (!sessionIdFromUrl) {
            setError('No active session ID found to generate archetype.');
            return;
        }
        setIsGeneratingArchetype(true);
        setArchetypeError(null);
        setImageError(null);
        setArchetypeResult(null);
        setImageDataUrl(null);
        try {
            const response = await fetch('/api/archetype/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionIdFromUrl }),
            });
             if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
                throw new Error(errorData.error || `Archetype generation failed: ${response.status}`);
            }
            const result: ArchetypeResult = await response.json();
            setArchetypeResult(result);
        } catch (err: any) {
             console.error('Error generating archetype:', err);
            setArchetypeError(err.message || 'An unknown error occurred while generating the archetype.');
            setError(null);
        } finally {
            setIsGeneratingArchetype(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!archetypeResult?.imagePrompt) {
            setImageError('Image prompt is missing from the archetype data. Cannot generate image.');
            return;
        }
        setIsGeneratingImage(true);
        setImageError(null);
        setImageDataUrl(null);

        try {
            const response = await fetch('/api/archetype/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePrompt: archetypeResult.imagePrompt }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse image generation error' }));
                throw new Error(errorData.error || `Image generation failed: ${response.status}`);
            }
            const responseBody = await response.json();
            const fetchedUrl = responseBody.imageUrl;

            if (!fetchedUrl) {
                throw new Error('Image data URL not received from server (expected \'imageUrl\' field in response. Ensure backend sends { imageUrl: "..." }).');
            }
            setImageDataUrl(fetchedUrl);
        } catch (err: any) {
            console.error('Error generating image:', err);
            setImageError(err.message || 'An unknown error occurred while generating the image.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return (
        <Flex direction="column" minH="100vh">
            <Navbar />
            <Container maxW="container.xl" py={10}>
                <VStack spacing={6} align="stretch">
                    <Heading as="h1" size="xl" textAlign="center">
                        Terra & Archetype Test Page
                    </Heading>

                    {!dataReport && !isLoadingData && (
                        <Button 
                            colorScheme="teal" 
                            onClick={handleConnectTerra} 
                            isLoading={isLoadingData} 
                            loadingText={loadingMessage}
                            size="lg"
                            alignSelf="center"
                        >
                            Connect to Terra & Fetch Data
                        </Button>
                    )}

                    {(isLoadingData || isGeneratingArchetype || isGeneratingImage) && (
                        <Box textAlign="center">
                            <Spinner size="xl" />
                            <Text mt={2}>
                                {isGeneratingImage ? 'Generating Image...' 
                                 : isGeneratingArchetype ? 'Generating Archetype...' 
                                 : loadingMessage}
                            </Text>
                        </Box>
                    )}

                    {error && (
                        <Alert status="error" mt={4}>
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    {archetypeError && (
                        <Alert status="error" mt={4}>
                            <AlertIcon />
                            {archetypeError}
                        </Alert>
                    )}
                    {imageError && (
                        <Alert status="error" mt={4}>
                            <AlertIcon />
                            {imageError}
                        </Alert>
                    )}

                    {/* Single Accordion for all collapsible content */}
                    <Accordion allowToggle defaultIndex={[]}>
                        {dataReport && (
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <Heading size="md">Terra Health Data Report</Heading>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <Box borderWidth="1px" borderRadius="lg" p={4} overflowX="auto" bg="gray.50">
                                        <Code as="pre" p={2} borderRadius="md" whiteSpace="pre-wrap" wordBreak="break-all">
                                            {JSON.stringify(dataReport, null, 2)}
                                        </Code>
                                    </Box>
                                </AccordionPanel>
                            </AccordionItem>
                        )}

                        {/* AI Health Archetype Section (Text) */}
                        {archetypeResult && (
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <Heading size="md">AI Health Archetype</Heading>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <VStack align="start" spacing={3}>
                                        <Text><strong>Name:</strong> {archetypeResult.archetypeName}</Text>
                                        <Text><strong>Description:</strong> {archetypeResult.archetypeDescription}</Text>
                                        <Text><strong>Image Prompt:</strong> <Code>{archetypeResult.imagePrompt}</Code></Text>
                                        <Text><strong>Sliders:</strong></Text>
                                        <Box pl={4}>
                                            {Object.entries(archetypeResult.sliderValues).map(([key, value]) => (
                                                <Text key={key}>{key}: {value}</Text>
                                            ))}
                                        </Box>
                                    </VStack>
                                    {/* Display Image Generation Button if archetype is loaded, prompt exists, and no image yet */}
                                    {archetypeResult.imagePrompt && !imageDataUrl && !isGeneratingImage && (
                                        <Button 
                                            colorScheme="green" 
                                            onClick={handleGenerateImage} 
                                            isLoading={isGeneratingImage} 
                                            loadingText="Generating Image..."
                                            size="md"
                                            mt={4}
                                        >
                                            Generate Archetype Image
                                        </Button>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        )}

                        {/* Generated Archetype Image Section */}
                        {imageDataUrl && !isGeneratingImage && archetypeResult && (
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <Heading size="md">Generated Archetype Image</Heading>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4} textAlign="center">
                                    <img 
                                        src={imageDataUrl} 
                                        alt={`${archetypeResult.archetypeName || 'Generated'} Archetype Avatar`} 
                                        style={{ maxWidth: '100%', maxHeight: '512px', margin: 'auto', border: '1px solid #eee' }}
                                    />
                                </AccordionPanel>
                            </AccordionItem>
                        )}
                    </Accordion>
                    
                    {/* Button to Generate Archetype - appears after data report is loaded and before archetype is generated */}
                    {dataReport && !archetypeResult && !isGeneratingArchetype && (
                        <Button 
                            colorScheme="purple" 
                            onClick={handleGenerateArchetype} 
                            isLoading={isGeneratingArchetype} 
                            loadingText="Generating Archetype..." // Updated loading text
                            size="lg"
                            alignSelf="center"
                            mt={4}
                        >
                            Generate Archetype
                        </Button>
                    )}

                    {sessionIdFromUrl && !isLoadingData && !dataReport && !error && (
                        <Text textAlign="center">
                            Session active: {sessionIdFromUrl}. 
                            {searchParams.get('user_id') ? 'Awaiting data...' : 'Ready to connect or waiting for redirect.'}
                        </Text>
                    )}

                </VStack>
            </Container>
        </Flex>
    );
}; 