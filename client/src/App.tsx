import { ChakraProvider, Container, Heading, Text, VStack, List, ListItem, Code, Divider, Box, Button } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import { TerraDataViewerPage } from './pages/TerraDataViewerPage'; // Ensure this path is correct
import LandingPage from './pages/LandingPage'; // Import the new LandingPage
import ArchetypeFlowPage from './pages/ArchetypeFlowPage'; // Import the new flow page

// Component for the Home Page content
// const HomePage = () => ( ... );

function App() {
  return (
    // ChakraProvider is already in main.tsx, so not needed here if App is always child of it.
    // However, if App can be rendered outside that context in tests or Storybook, keep it.
    // For simplicity with main.tsx setup, let's assume it's not strictly needed here.
    <Routes>
      <Route path="/" element={<LandingPage />} /> {/* Use LandingPage for root path */}
      <Route path="/flow" element={<ArchetypeFlowPage />} /> {/* Add route for the flow page */}
      <Route path="/terra-data-viewer" element={<TerraDataViewerPage />} />
      {/* Other routes will go here */}
    </Routes>
  );
}

export default App;
