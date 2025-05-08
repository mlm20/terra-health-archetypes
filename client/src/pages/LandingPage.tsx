import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    Spinner,
    Alert,
    AlertIcon,
    useColorModeValue,
    Link,
    Flex,
} from '@chakra-ui/react';
import { useTerraConnect } from '../hooks/useTerraConnect';
import Navbar from '../components/Navbar';

export const LandingPage: React.FC = () => {
    const { initiateConnection, isLoading, error } = useTerraConnect();

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBgColor = useColorModeValue('white', 'gray.800');

    return (
        <Flex direction="column" minH="100vh" bg={bgColor}>
            <Navbar />
            <Container 
                maxW="container.md" 
                centerContent 
                py={{ base: '12', md: '24' }}
                flex="1"
                display="flex"
                flexDirection="column"
                justifyContent="center"
            >
                <VStack 
                    spacing={6} 
                    textAlign="center"
                    bg={cardBgColor}
                    p={{ base: 6, md: 10 }}
                    borderRadius="xl"
                    boxShadow="lg"
                    w="full"
                >
                    <Heading as="h1" size="2xl" bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
                        🧬 Health Archetypes
                    </Heading>
                    <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
                        Discover your unique health vibe, powered by your real wearable data.
                    </Text>
                    <VStack spacing={3} align="start" textAlign="left" maxW="sm">
                        <Text>✅ No login or signup required.</Text>
                        <Text>✨ Get one personalized health archetype.</Text>
                        <Text>🗑️ All data is processed locally and deleted after your session.</Text>
                    </VStack>
                    
                    {error && (
                        <Alert status="error" borderRadius="md">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <Button
                        colorScheme="teal"
                        size="lg"
                        onClick={initiateConnection}
                        isLoading={isLoading}
                        loadingText="Connecting..."
                        spinnerPlacement="start"
                        mt={4}
                        w="full"
                        maxW="sm"
                    >
                        Connect Your Wearable
                    </Button>

                    <Text fontSize="xs" color="gray.500" mt={4}>
                        We use Terra to securely connect to your device.
                    </Text>

                    <Box mt={6} borderTopWidth={1} pt={4} borderColor="gray.200">
                        <Text fontSize="xs" color="gray.500">
                            Developer? 
                            <Link as={RouterLink} to="/terra-data-viewer" color="teal.500" ml={1}> 
                                Go to Test Flow Page
                            </Link>
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    );
};

export default LandingPage; 