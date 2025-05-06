import { Container, Heading, Text, VStack, List, ListItem, Code } from '@chakra-ui/react';

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
      p={8} 
      bg="gray.50"
      textAlign="center"
    >
      <VStack spacing={8}>
        <Heading as="h1" size="xl" color="gray.700">
          Health Archetypes Demo - Boilerplate
        </Heading>
        
        <Text fontSize="lg" color="gray.600">
          This is the starting point for the Health Archetypes application.
        </Text>

        <Text fontSize="md" color="gray.700" fontWeight="semibold">
          Technologies Used:
        </Text>
        
        <List spacing={2} styleType="disc" pl={6} textAlign="left">
          <ListItem><Code>React (via Vite)</Code> - Frontend library</ListItem>
          <ListItem><Code>TypeScript</Code> - Static typing</ListItem>
          <ListItem><Code>Chakra UI</Code> - Component library</ListItem>
          <ListItem><Code>Tailwind CSS</Code> - Utility CSS framework (v3.x)</ListItem>
          <ListItem><Code>Node.js (Express)</Code> - Backend runtime & framework</ListItem>
          <ListItem><Code>Terra API</Code> - Health data aggregation</ListItem>
          <ListItem><Code>OpenAI API</Code> - LLM and Image Generation</ListItem>
        </List>

      </VStack>
    </Container>
  );
}

export default App;
