import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    useColorModeValue,
    Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export const LandingPage: React.FC = () => {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBgColor = useColorModeValue("white", "gray.800");

    return (
        <Flex direction="column" minH="100vh" bg={bgColor}>
            <Navbar />
            <Container
                maxW="container.md"
                centerContent
                py={{ base: "12", md: "24" }}
                flex="1"
                display="flex"
                flexDirection="column"
                justifyContent="center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: "100%" }}
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
                        <Heading
                            as="h1"
                            size="2xl"
                            bgGradient="linear(to-r, teal.400, blue.500)"
                            bgClip="text"
                            lineHeight="1.5"
                        >
                            🧬 Health Archetypes
                        </Heading>
                        <Text
                            fontSize="lg"
                            color={useColorModeValue("gray.600", "gray.300")}
                        >
                            Discover your unique health vibe, powered by your
                            real wearable data.
                        </Text>
                        <VStack
                            spacing={3}
                            align="start"
                            textAlign="left"
                            maxW="sm"
                        >
                            <Text>✅ No login or signup required.</Text>
                            <Text>
                                ✨ Get one personalized health archetype.
                            </Text>
                            <Text>
                                🗑️ All data is processed locally and deleted
                                after your session.
                            </Text>
                        </VStack>

                        <Button
                            as={RouterLink}
                            to="/flow"
                            colorScheme="teal"
                            size="lg"
                            w="full"
                            maxW="sm"
                        >
                            Start
                        </Button>
                    </VStack>
                </motion.div>
            </Container>
        </Flex>
    );
};

export default LandingPage;
