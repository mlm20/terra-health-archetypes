import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
    useBreakpointValue,
} from "@chakra-ui/react";
import ProgressStepper, { type StepStatusType } from "../components/Stepper"; // Import the stepper component and StepStatusType as type
import ArchetypeCard from "../components/ArchetypeCard"; // Import the ArchetypeCard component
import Navbar from "../components/Navbar"; // Import Navbar

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
    // const [activeStep, setActiveStep] = useState<number>(STEP_DEVICE_CONNECTED); // Start at first step - no longer needed directly

    // State for data and flow control
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [terraUserId, setTerraUserId] = useState<string | null>(null);
    const [healthReport, setHealthReport] = useState<HealthDataReport | null>(
        null
    );
    const [archetypeData, setArchetypeData] = useState<ArchetypeResult | null>(
        null
    );
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

    // State for loading indicators
    const [isConfirmingAuth, setIsConfirmingAuth] = useState<boolean>(false);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
    const [isGeneratingArchetype, setIsGeneratingArchetype] =
        useState<boolean>(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [isClearingData, setIsClearingData] = useState<boolean>(false); // Add state for data clearance

    // State for errors
    const [flowError, setFlowError] = useState<string | null>(null); // General error for the flow

    const bgColor = useColorModeValue("gray.50", "gray.800");

    // Derive step statuses based on current state
    const stepStatuses: StepStatusType[] = useMemo(() => {
        const statuses: StepStatusType[] = ["idle", "idle", "idle", "idle"];

        if (flowError) {
            // If there's a flow error, mark the current step as error
            // Determine which step was active when the error occurred
            // This is a simplified approach; more detailed error handling might be needed
            if (isConfirmingAuth) statuses[STEP_DEVICE_CONNECTED] = "error";
            else if (isFetchingData) statuses[STEP_DATA_OBTAINED] = "error";
            else if (isGeneratingArchetype)
                statuses[STEP_ARCHETYPE_DISCOVERED] = "error";
            else if (isGeneratingImage)
                statuses[STEP_ARCHETYPE_DISCOVERED] =
                    "error"; // Image generation is part of archetype discovery step visually
            else if (isClearingData) statuses[STEP_DATA_CLEARED] = "error";
            else if (
                sessionId &&
                terraUserId &&
                !healthReport &&
                !archetypeData &&
                !imageDataUrl
            ) {
                // Error before any async operation started, likely from initial param check
                statuses[STEP_DEVICE_CONNECTED] = "error";
            }
            // Mark all subsequent steps as idle
            let errorStepIndex = statuses.findIndex(
                (status) => status === "error"
            );
            if (errorStepIndex !== -1) {
                for (let i = errorStepIndex + 1; i < statuses.length; i++) {
                    statuses[i] = "idle";
                }
            }
            return statuses;
        }

        // Happy path statuses
        if (sessionId && terraUserId)
            statuses[STEP_DEVICE_CONNECTED] = "complete";

        if (isConfirmingAuth) statuses[STEP_DEVICE_CONNECTED] = "ongoing";

        if (healthReport) statuses[STEP_DATA_OBTAINED] = "complete";
        else if (isFetchingData) statuses[STEP_DATA_OBTAINED] = "ongoing";
        else if (sessionId && terraUserId && !isConfirmingAuth)
            statuses[STEP_DATA_OBTAINED] = "idle"; // Ready to start fetching

        if (archetypeData && imageDataUrl)
            statuses[STEP_ARCHETYPE_DISCOVERED] = "complete";
        else if (isGeneratingArchetype || isGeneratingImage)
            statuses[STEP_ARCHETYPE_DISCOVERED] = "ongoing";
        else if (healthReport) statuses[STEP_ARCHETYPE_DISCOVERED] = "idle"; // Ready to start archetype generation

        if (isClearingData) statuses[STEP_DATA_CLEARED] = "ongoing";
        // Assuming Data Cleared is the final step and always completes if reached without error
        // We might need a separate state if clearance can fail or is a distinct async op
        else if (
            archetypeData &&
            imageDataUrl &&
            !isGeneratingArchetype &&
            !isGeneratingImage &&
            !isClearingData &&
            !flowError
        ) {
            // This is a simplification; ideally, there'd be a state for clearance completion
            // For now, assume if we've reached here and no errors/ongoing tasks, it's complete
            statuses[STEP_DATA_CLEARED] = "complete";
        } else if (
            archetypeData &&
            imageDataUrl &&
            !isGeneratingArchetype &&
            !isGeneratingImage
        )
            statuses[STEP_DATA_CLEARED] = "idle"; // Ready for clearance

        return statuses;
    }, [
        sessionId,
        terraUserId,
        healthReport,
        archetypeData,
        imageDataUrl,
        isConfirmingAuth,
        isFetchingData,
        isGeneratingArchetype,
        isGeneratingImage,
        isClearingData,
        flowError,
    ]);

    // Effect 1: Initial check for URL params and auth confirmation
    useEffect(() => {
        const sid = searchParams.get("sessionId");
        const tid = searchParams.get("user_id");
        const authError = searchParams.get("error");

        setFlowError(null); // Clear previous errors on new load

        if (authError) {
            setFlowError(`Authentication failed: ${authError}`);
            // Stop the flow here, maybe set activeStep to an error state if desired
            return;
        }

        if (sid && tid) {
            setSessionId(sid);
            setTerraUserId(tid);
            // setActiveStep(STEP_DEVICE_CONNECTED); // Mark device connected - Handled by derived status
            setIsConfirmingAuth(true);

            // Confirm auth with backend
            fetch("/api/terra/confirm-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sid,
                    terraUserIdFromUrl: tid,
                }),
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(
                            errorData.error ||
                                `Confirm auth failed (${res.status})`
                        );
                    }
                    return res.json();
                })
                .then(() => {
                    console.log("Auth confirmed successfully.");
                    // Auth success, state update will trigger next effect
                })
                .catch((err) => {
                    console.error("Auth Confirmation Error:", err);
                    setFlowError(
                        err.message ||
                            "Failed to confirm authentication with backend."
                    );
                    // Consider resetting state or stopping flow
                })
                .finally(() => {
                    setIsConfirmingAuth(false);
                });
        } else if (sid && !tid) {
            // Might happen if user bookmarks/reloads page after auth but before full flow
            // Or if Terra redirect somehow misses user_id
            setFlowError(
                "Missing user ID from Terra redirect. Please try connecting again."
            );
            // Potentially attempt to fetch data if session is valid? For now, show error.
        } else {
            // No sessionId, likely user navigated here directly without starting flow
            // Should ideally redirect to LandingPage or show message
            setFlowError(
                "No active session found. Please start from the beginning."
            );
        }
    }, [searchParams]);

    // Effect 2: Fetch health data report after auth is confirmed
    useEffect(() => {
        // Trigger only if auth is done (sessionId & terraUserId are set) and data isn't already fetched/fetching
        if (
            sessionId &&
            terraUserId &&
            !isConfirmingAuth &&
            !healthReport &&
            !isFetchingData &&
            !flowError
        ) {
            setIsFetchingData(true);
            console.log("Fetching health data report...");

            fetch(`/api/terra/data-report/${sessionId}`)
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(
                            errorData.error ||
                                `Data report fetch failed (${res.status})`
                        );
                    }
                    return res.json();
                })
                .then((report: HealthDataReport) => {
                    setHealthReport(report);
                    // setActiveStep(STEP_DATA_OBTAINED); // Move stepper forward - Handled by derived status
                    console.log("Health data obtained.");
                })
                .catch((err) => {
                    console.error("Fetch Data Error:", err);
                    setFlowError(
                        err.message || "Failed to fetch health data report."
                    );
                })
                .finally(() => {
                    setIsFetchingData(false);
                });
        }
    }, [
        sessionId,
        terraUserId,
        isConfirmingAuth,
        healthReport,
        isFetchingData,
        flowError,
    ]);

    // Effect 3: Generate archetype text after health data is obtained
    useEffect(() => {
        // Trigger only if data is present and archetype isn't fetched/fetching
        if (
            healthReport &&
            sessionId &&
            !archetypeData &&
            !isGeneratingArchetype &&
            !flowError
        ) {
            setIsGeneratingArchetype(true);
            console.log("Generating archetype text...");

            fetch("/api/archetype/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(
                            errorData.error ||
                                `Archetype generation failed (${res.status})`
                        );
                    }
                    return res.json();
                })
                .then((result: ArchetypeResult) => {
                    setArchetypeData(result);
                    // Don't advance step yet, wait for image - Handled by derived status
                    console.log("Archetype text generated.");
                })
                .catch((err) => {
                    console.error("Generate Archetype Text Error:", err);
                    setFlowError(
                        err.message || "Failed to generate archetype text."
                    );
                })
                .finally(() => {
                    setIsGeneratingArchetype(false);
                });
        }
    }, [
        healthReport,
        sessionId,
        archetypeData,
        isGeneratingArchetype,
        flowError,
    ]);

    // Effect 4: Generate archetype image after archetype text (and prompt) is obtained
    useEffect(() => {
        // Trigger only if archetype text is present, prompt exists, and image isn't fetched/fetching
        if (
            archetypeData?.imagePrompt &&
            !imageDataUrl &&
            !isGeneratingImage &&
            !flowError
        ) {
            setIsGeneratingImage(true);
            console.log("Generating archetype image...");

            fetch("/api/archetype/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imagePrompt: archetypeData.imagePrompt,
                }),
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(
                            errorData.error ||
                                `Image generation failed (${res.status})`
                        );
                    }
                    return res.json();
                })
                .then((result) => {
                    if (!result.imageUrl) {
                        // Backend sends { imageUrl: dataUrl }
                        throw new Error(
                            "Image data URL not received from server."
                        );
                    }
                    setImageDataUrl(result.imageUrl);
                    // setActiveStep(STEP_ARCHETYPE_DISCOVERED); // Advance step after image is ready - Handled by derived status
                    console.log("Archetype image generated.");
                    // TODO: Trigger data clearance step?
                    // setTimeout(() => setActiveStep(STEP_DATA_CLEARED), 1500); // Simulate clearance delay - Handled by derived status or new state

                    // Assuming data clearance is a quick final step or part of cleanup after image generation
                    // We can set isClearingData true briefly if there's an async clearance call
                    // For now, simulate with a timeout or tie to image generation completion
                    // Example: setIsClearingData(true); setTimeout(() => setIsClearingData(false), 1000);
                })
                .catch((err) => {
                    console.error("Generate Image Error:", err);
                    setFlowError(
                        err.message || "Failed to generate archetype image."
                    );
                    // Still show archetype text? For now, error stops the flow update.
                })
                .finally(() => {
                    setIsGeneratingImage(false);
                    // Assuming data clearance starts immediately after image generation completes without error
                    if (!flowError) {
                        // This is a placeholder. If data clearance is an API call,
                        // trigger that call here and use its loading state.
                        setIsClearingData(true); // Indicate clearance is ongoing
                        // Simulate async clearance completion
                        setTimeout(() => setIsClearingData(false), 1000); // Assuming it takes 1 second
                    }
                });
        }
    }, [archetypeData, imageDataUrl, isGeneratingImage, flowError]);

    const isLoading =
        isConfirmingAuth ||
        isFetchingData ||
        isGeneratingArchetype ||
        isGeneratingImage ||
        isClearingData;
    const loadingText = isConfirmingAuth
        ? "Confirming Auth..."
        : isFetchingData
        ? "Fetching Health Data..."
        : isGeneratingArchetype
        ? "Generating Archetype..."
        : isGeneratingImage
        ? "Generating Image..."
        : isClearingData
        ? "Clearing Data..."
        : "Processing...";

    // Helper function to render main content based on state
    const renderMainContent = () => {
        if (flowError) {
            return (
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Text>{flowError}</Text>
                </Alert>
            );
        }

        if (isLoading || !archetypeData || !imageDataUrl) {
            // Show loading state while any async operation is ongoing or waiting for final results
            return (
                <VStack
                    spacing={4}
                    align="center"
                    justify="center"
                    height="100%"
                >
                    <Spinner
                        size="xl"
                        thickness="4px"
                        color="teal.500"
                        emptyColor="gray.200"
                    />
                    <Text
                        fontSize="xl"
                        color={useColorModeValue("gray.600", "gray.400")}
                    >
                        {loadingText}
                    </Text>
                </VStack>
            );
        }

        // Happy path: show archetype card after all steps are complete
        return (
            <ArchetypeCard
                archetypeName={archetypeData.archetypeName}
                archetypeDescription={archetypeData.archetypeDescription}
                sliderValues={archetypeData.sliderValues}
                imageDataUrl={imageDataUrl}
            />
        );
    };

    const sidebarWidth = useBreakpointValue({ base: "100%", md: "300px" });

    return (
        <Box minHeight="100vh" bg={useColorModeValue("#F4F6F8", "gray.900")}>
            {" "}
            {/* Use a very light grey for page background */}
            <Navbar />
            <Flex
                direction={{ base: "column", md: "row" }}
                minH="calc(100vh - var(--chakra-sizes-16))"
            >
                {" "}
                {/* Use Flex for main layout below navbar */}
                {/* Sidebar */}
                <Box
                    width={sidebarWidth}
                    flexShrink={0} // Prevent shrinking
                    bg={useColorModeValue("white", "gray.800")} // Clean white background for sidebar
                    p={{ base: 8, md: 12 }} // Consistent padding inside sidebar, matching main content
                    position={{ md: "sticky" }} // Make sidebar sticky on medium and larger screens
                    top={{ md: "var(--chakra-sizes-16)" }} // Position sticky sidebar below navbar
                    height={{ md: "calc(100vh - var(--chakra-sizes-16))" }} // Make sidebar full height on desktop
                    overflowY={{ md: "auto" }} // Add scroll if content overflows on desktop
                    borderRight="1px solid" // Add right border
                    borderColor={useColorModeValue("gray.200", "gray.700")} // Border color
                    minH={{
                        base: "auto",
                        md: "calc(100vh - var(--chakra-sizes-16))",
                    }} // Ensure min height on mobile too
                >
                    <ProgressStepper stepStatuses={stepStatuses} />
                </Box>
                {/* Main Content */}
                <Box flex="1" p={{ base: 6, md: 10 }}>
                    {" "}
                    {/* Main content takes remaining space, with generous responsive padding */}
                    <Box
                        p={{ base: 8, md: 12 }}
                        borderWidth="1px"
                        borderRadius="lg"
                        shadow="lg"
                        bg={useColorModeValue("white", "gray.800")}
                        minHeight="400px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 4px 12px rgba(0,0,0,0.05)"
                    >
                        {" "}
                        {/* Card styling for main content, generous responsive padding, soft shadow */}
                        {renderMainContent()}
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
};

export default ArchetypeFlowPage;
