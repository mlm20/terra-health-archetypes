import React from 'react';
import {
    Box,
    Flex,
    Heading,
    IconButton,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa'; // Using react-icons for theme toggle icons

export const Navbar: React.FC = () => {
    const { toggleColorMode } = useColorMode();
    const SwitchIcon = useColorModeValue(FaMoon, FaSun);
    const navBg = useColorModeValue('white', 'gray.800');

    return (
        <Box 
            as="nav" 
            w="full" 
            py={3}
            boxShadow="sm"
            bg={navBg}
            position="sticky" // Make navbar sticky
            top={0}
            zIndex="sticky" // Ensure it stays above other content
        >
            <Flex align="center" justify="space-between" px={{ base: 6, md: 10 }}> {/* Add responsive horizontal padding to align with main content */}
                <Heading size="md" bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
                    🧬 Health Archetypes
                </Heading>
                <IconButton
                    size="md"
                    fontSize="lg"
                    aria-label={`Switch to ${useColorModeValue('dark', 'light')} mode`}
                    variant="ghost"
                    color="current"
                    onClick={toggleColorMode}
                    icon={<SwitchIcon />}
                />
            </Flex>
        </Box>
    );
};

export default Navbar; 