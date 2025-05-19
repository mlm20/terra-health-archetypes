import React, { useRef } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Image,
    Progress,
    useColorModeValue,
    Divider,
    Tag, // Use Tag for slider names
    Button,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';
import { useImageExport } from '../hooks/useImageExport';

// Interface for the props expected by the ArchetypeCard
export interface ArchetypeCardProps {
    archetypeName: string;
    archetypeDescription: string;
    imageDataUrl: string | null | undefined; // Data URL for the image
    sliderValues: Record<string, number>; // e.g., { "Recovery Readiness": 75, ... }
    // Optional: userName?: string;
}

// Function to format slider names (e.g., "recoveryReadiness" -> "Recovery Readiness")
// This assumes keys in sliderValues are camelCase matching the LLM response spec, 
// but we want to display them nicely.
// Alternatively, we can expect pre-formatted keys or use a mapping.
const formatSliderName = (key: string): string => {
    const words = key.replace(/([A-Z])/g, ' $1');
    return words.charAt(0).toUpperCase() + words.slice(1);
};

export const ArchetypeCard: React.FC<ArchetypeCardProps> = ({
    archetypeName,
    archetypeDescription,
    imageDataUrl,
    sliderValues,
}) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const sliderColorScheme = 'teal'; // Or choose another color scheme
    const sliderTrackColor = useColorModeValue('gray.100', 'gray.600');

    // Ref for the card element to export
    const cardRef = useRef<HTMLDivElement>(null);
    // Use the image export hook
    const { exportToPng, isExporting, error: exportError } = useImageExport(cardRef);

    return (
        <Box 
            ref={cardRef} 
            bg={cardBg} 
            p={6} 
            borderRadius="xl" 
            boxShadow="xl"
            maxW="sm"
            w="full"
            borderWidth={1}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
            <VStack spacing={5} align="stretch">
                {/* Image/Avatar Section */}
                <Box 
                    w="full" // Make the container fill the available width
                    bg={useColorModeValue('gray.100', 'gray.700')} 
                    borderRadius="lg" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    overflow="hidden"
                >
                    {imageDataUrl ? (
                        <Image 
                            src={imageDataUrl} 
                            alt={`${archetypeName} Avatar`} 
                            objectFit="cover" // Use cover. With a 1:1 image and w="full", this will fill the dynamic square container.
                            w="full" // Ensure image takes full width of its container
                            h="auto" // Allow height to adjust based on aspect ratio
                        />
                    ) : (
                        <Text color="gray.500">No Image Available</Text>
                    )}
                </Box>

                {/* Text Details Section */}
                <VStack spacing={2} align="center" textAlign="center">
                    <Heading size="lg">{archetypeName}</Heading>
                    <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.300')}>{archetypeDescription}</Text>
                </VStack>

                <Divider />

                {/* Sliders Section */}
                <VStack spacing={4} align="stretch">
                    <Heading size="sm" textAlign="center">Health Traits</Heading>
                    {Object.entries(sliderValues).map(([key, value]) => (
                        <Box key={key}>
                            <HStack justify="space-between" mb={1}>
                                <Tag size="sm" variant="subtle" colorScheme={sliderColorScheme}>
                                    {formatSliderName(key)}
                                </Tag>
                                <Text fontSize="sm" fontWeight="bold">{value}</Text>
                            </HStack>
                            <Progress 
                                value={value} 
                                size="sm" 
                                colorScheme={sliderColorScheme} 
                                bg={sliderTrackColor}
                                borderRadius="full"
                            />
                        </Box>
                    ))}
                </VStack>
                
                {/* Placeholder for User Name Input (Optional) - Maybe added later */}

                <Divider mt={3}/>

                {/* Export Section */}
                <VStack pt={2}>
                    {exportError && (
                        <Alert status="error" size="sm" borderRadius="md">
                            <AlertIcon />
                            {exportError}
                        </Alert>
                    )}
                    <Button 
                        colorScheme="blue" 
                        onClick={() => exportToPng(archetypeName.replace(/\s+/g, '-').toLowerCase())} // Pass formatted name for download
                        isLoading={isExporting}
                        loadingText="Generating Image..."
                        w="full"
                    >
                        Download
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default ArchetypeCard; 