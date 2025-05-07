import { Container, Heading, Text, VStack, List, ListItem, Code, Divider, Box } from '@chakra-ui/react';

function App() {
  return (
    <Container 
      centerContent 
      maxW="container.lg" 
      minHeight="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      p={{ base: 4, md: 8 }} // Responsive padding
      textAlign="center"
    >
      <VStack spacing={6} width="100%">
        <Heading as="h1" size="xl" color="gray.700">
          Health Archetypes Demo - Starting Point
        </Heading>
        
        <Text fontSize="lg" color="gray.600">
          This is the initial boilerplate for the Health Archetypes application.
        </Text>

        <Box width={{ base: '90%', md: '80%' }} p={6} borderWidth={1} borderRadius="lg" borderColor="gray.200" bg="white" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <Heading as="h2" size="md" color="gray.700" mb={2}>Technologies Installed:</Heading>
            <List spacing={2} textAlign="left" stylePosition="inside">
              <ListItem><Code colorScheme="purple">React (via Vite)</Code> - Frontend library</ListItem>
              <ListItem><Code colorScheme="blue">TypeScript</Code> - Static typing</ListItem>
              <ListItem><Code colorScheme="teal">Chakra UI</Code> - Component library</ListItem>
              <ListItem><Code colorScheme="cyan">Tailwind CSS (v3.x)</Code> - Utility CSS framework</ListItem>
              <ListItem><Code colorScheme="green">Node.js (Express)</Code> - Backend runtime & framework</ListItem>
            </List>
            
            <Divider my={4} borderColor="gray.300" />

            <Heading as="h2" size="md" color="gray.700" mb={2}>Key APIs We'll Be Working With:</Heading>
            <List spacing={2} textAlign="left" stylePosition="inside">
              <ListItem><Code colorScheme="orange">Terra API</Code> - Health data aggregation</ListItem>
              <ListItem><Code colorScheme="pink">OpenAI API</Code> - LLM and Image Generation</ListItem>
            </List>
          </VStack>
        </Box>

      </VStack>
    </Container>
  );
}

export default App;
