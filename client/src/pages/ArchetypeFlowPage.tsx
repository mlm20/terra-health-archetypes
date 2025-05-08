import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Spinner,
    Alert,
    AlertIcon,
    VStack,
    useColorModeValue,
    Flex,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import ProgressStepper from '../components/Stepper'; // Import the stepper component
import ArchetypeCard from '../components/ArchetypeCard'; // Import the ArchetypeCard component
import Navbar from '../components/Navbar'; // Import Navbar

// Interfaces (Consider moving to a shared types file later)
interface HealthDataReport {
    // Assuming the same structure as in TerraDataViewerPage
    timePeriodDays: number;
    healthData: any; // Simplified for now
    dataAvailabilityNotes: string[];
}

interface ArchetypeResult {
    // Assuming the same structure as in TerraDataViewerPage
    archetypeName: string;
    archetypeDescription: string;
    imagePrompt: string;
    sliderValues: Record<string, number>;
    imageDataUrl?: string; // Optional as it's fetched separately
}

// Define the steps for indexing
const STEP_DEVICE_CONNECTED = 0;
const STEP_DATA_OBTAINED = 1;
const STEP_ARCHETYPE_DISCOVERED = 2;
const STEP_DATA_CLEARED = 3; // Or "Completed"

export const ArchetypeFlowPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [activeStep, setActiveStep] = useState<number>(STEP_DEVICE_CONNECTED); // Start at first step

    // State for data and flow control
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [terraUserId, setTerraUserId] = useState<string | null>(null);
    const [healthReport, setHealthReport] = useState<HealthDataReport | null>(null);
    const [archetypeData, setArchetypeData] = useState<ArchetypeResult | null>(null);
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

    // State for loading indicators
    const [isConfirmingAuth, setIsConfirmingAuth] = useState<boolean>(false);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
    const [isGeneratingArchetype, setIsGeneratingArchetype] = useState<boolean>(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

    // State for errors
    const [flowError, setFlowError] = useState<string | null>(null); // General error for the flow

    const bgColor = useColorModeValue('gray.50', 'gray.800');

    // Effect 1: Initial check for URL params and auth confirmation
    useEffect(() => {
        const sid = searchParams.get('sessionId');
        const tid = searchParams.get('user_id');
        const authError = searchParams.get('error');

        setFlowError(null); // Clear previous errors on new load

        if (authError) {
            setFlowError(`Authentication failed: ${authError}`);
            // Stop the flow here, maybe set activeStep to an error state if desired
            return;
        }

        if (sid && tid) {
            setSessionId(sid);
            setTerraUserId(tid);
            setActiveStep(STEP_DEVICE_CONNECTED); // Mark device connected
            setIsConfirmingAuth(true);

            // Confirm auth with backend
            fetch('/api/terra/confirm-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sid, terraUserIdFromUrl: tid }),
            })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Confirm auth failed (${res.status})`);
                }
                return res.json();
            })
            .then(() => {
                console.log('Auth confirmed successfully.');
                // Auth success, state update will trigger next effect
            })
            .catch(err => {
                console.error('Auth Confirmation Error:', err);
                setFlowError(err.message || 'Failed to confirm authentication with backend.');
                // Consider resetting state or stopping flow
            })
            .finally(() => {
                setIsConfirmingAuth(false);
            });
        } else if (sid && !tid) {
            // Might happen if user bookmarks/reloads page after auth but before full flow
            // Or if Terra redirect somehow misses user_id
             setFlowError('Missing user ID from Terra redirect. Please try connecting again.');
             // Potentially attempt to fetch data if session is valid? For now, show error.
        } else {
             // No sessionId, likely user navigated here directly without starting flow
             // Should ideally redirect to LandingPage or show message
             setFlowError('No active session found. Please start from the beginning.');
        }

    }, [searchParams]);

    // Effect 2: Fetch health data report after auth is confirmed
    useEffect(() => {
        // Trigger only if auth is done (sessionId & terraUserId are set) and data isn't already fetched/fetching
        if (sessionId && terraUserId && !isConfirmingAuth && !healthReport && !isFetchingData && !flowError) {
            setIsFetchingData(true);
            console.log('Fetching health data report...');

            fetch(`/api/terra/data-report/${sessionId}`)
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.error || `Data report fetch failed (${res.status})`);
                    }
                    return res.json();
                })
                .then((report: HealthDataReport) => {
                    setHealthReport(report);
                    setActiveStep(STEP_DATA_OBTAINED); // Move stepper forward
                    console.log('Health data obtained.');
                })
                .catch(err => {
                    console.error('Fetch Data Error:', err);
                    setFlowError(err.message || 'Failed to fetch health data report.');
                })
                .finally(() => {
                    setIsFetchingData(false);
                });
        }
    }, [sessionId, terraUserId, isConfirmingAuth, healthReport, isFetchingData, flowError]);

    // Effect 3: Generate archetype text after health data is obtained
    useEffect(() => {
        // Trigger only if data is present and archetype isn't fetched/fetching
        if (healthReport && sessionId && !archetypeData && !isGeneratingArchetype && !flowError) {
            setIsGeneratingArchetype(true);
            console.log('Generating archetype text...');

            fetch('/api/archetype/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Archetype generation failed (${res.status})`);
                }
                return res.json();
            })
            .then((result: ArchetypeResult) => {
                setArchetypeData(result);
                // Don't advance step yet, wait for image
                console.log('Archetype text generated.');
            })
            .catch(err => {
                console.error('Generate Archetype Text Error:', err);
                setFlowError(err.message || 'Failed to generate archetype text.');
            })
            .finally(() => {
                setIsGeneratingArchetype(false);
            });
        }
    }, [healthReport, sessionId, archetypeData, isGeneratingArchetype, flowError]);

     // Effect 4: Generate archetype image after archetype text (and prompt) is obtained
    useEffect(() => {
        // Trigger only if archetype text is present, prompt exists, and image isn't fetched/fetching
        if (archetypeData?.imagePrompt && !imageDataUrl && !isGeneratingImage && !flowError) {
            setIsGeneratingImage(true);
            console.log('Generating archetype image...');

            fetch('/api/archetype/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePrompt: archetypeData.imagePrompt }),
            })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Image generation failed (${res.status})`);
                }
                 return res.json();
            })
            .then((result) => {
                 if (!result.imageUrl) { // Backend sends { imageUrl: dataUrl }
                    throw new Error('Image data URL not received from server.');
                 }
                 setImageDataUrl(result.imageUrl);
                 setActiveStep(STEP_ARCHETYPE_DISCOVERED); // Advance step after image is ready
                 console.log('Archetype image generated.');
                 // TODO: Trigger data clearance step?
                 setTimeout(() => setActiveStep(STEP_DATA_CLEARED), 1500); // Simulate clearance delay
            })
            .catch(err => {
                 console.error('Generate Image Error:', err);
                 setFlowError(err.message || 'Failed to generate archetype image.');
                 // Still show archetype text? For now, error stops the flow update.
            })
            .finally(() => {
                setIsGeneratingImage(false);
            });
        }
    }, [archetypeData, imageDataUrl, isGeneratingImage, flowError]);


    const isLoading = isConfirmingAuth || isFetchingData || isGeneratingArchetype || isGeneratingImage;
    const loadingText = isConfirmingAuth ? 'Confirming Auth...'
                      : isFetchingData ? 'Fetching Health Data...'
                      : isGeneratingArchetype ? 'Generating Archetype...'
                      : isGeneratingImage ? 'Generating Image...'
                      : 'Processing...';

    return (
        <Flex direction="column" minH="100vh" bg={bgColor}>
            <Navbar />
            <Container 
                maxW="container.xl"
                py={{ base: 6, md: 12 }}
                flex={1} 
                display="flex"
                alignItems="center"
            >
                <Grid 
                    templateColumns={{ base: "1fr", md: "auto 1fr" }}
                    gap={{ base: 6, md: 10 }}
                    w="full"
                    alignItems="start"
                >
                    <GridItem 
                        w={{ base: "full", md: "280px" }}
                        position={{ md: 'sticky' }}
                        top={{ md: '100px' }}
                    > 
                        <Heading size="lg" mb={6} textAlign={{ base: "center", md: "left" }}>Progress</Heading>
                        <ProgressStepper activeStep={activeStep} />
                    </GridItem>

                    <GridItem w="full">
                        <VStack spacing={6} align="stretch" minH="300px" justify="center">
                            {isLoading ? (
                                <VStack pt={8} justify="center" flex={1}>
                                    <Spinner size="xl" color="teal.500" thickness="4px" />
                                    <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>{loadingText}</Text>
                                </VStack>
                            ) : flowError ? (
                                <Alert status="error" borderRadius="md" variant="subtle" w="full">
                                    <AlertIcon />
                                    {flowError}
                                </Alert>
                            ) : activeStep === STEP_DATA_CLEARED ? (
                                <Alert status="success" borderRadius="md" variant="subtle" w="full">
                                    <AlertIcon />
                                    Processing complete and session data cleared.
                                </Alert>
                            ) : activeStep >= STEP_ARCHETYPE_DISCOVERED && archetypeData ? (
                                <Box w="full" display="flex" justifyContent={{ base: "center", md: "start" }}>
                                    <ArchetypeCard 
                                        archetypeName={archetypeData.archetypeName}
                                        archetypeDescription={archetypeData.archetypeDescription}
                                        imageDataUrl={imageDataUrl} 
                                        sliderValues={archetypeData.sliderValues}
                                    />
                                </Box>
                            ) : (
                                <Text color="gray.500">Processing...</Text> 
                            )}
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>
        </Flex>
    );
};

export default ArchetypeFlowPage; 