import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  useColorModeValue,
} from '@chakra-ui/react';

const steps = [
  { title: 'Device Connected', description: 'Wearable linked' },
  { title: 'Health Data Obtained', description: 'Syncing data' },
  { title: 'Archetype Discovered', description: 'Generating vibe' },
  { title: 'Data Cleared', description: 'Session wiped' },
];

interface ProgressStepperProps {
  activeStep: number; // 0-based index
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ activeStep }) => {
  // Adjust activeStep to be 1-based for useSteps hook if needed, 
  // or keep 0-based and use directly. Chakra examples often use 1-based.
  // Let's use the 0-based prop directly and adjust comparisons.
  const actualActiveStep = activeStep; // Use the 0-based prop

  const activeStepTextColor = useColorModeValue("gray.700", "gray.200");
  const inactiveStepTextColor = useColorModeValue("gray.500", "gray.500");

  return (
    <Stepper index={actualActiveStep} colorScheme="teal" orientation="vertical" height={`${steps.length * 70}px`} gap="0">
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            <StepStatus
              complete={`✅`}
              incomplete={`⏳`}
              active={`⏳`}
            />
          </StepIndicator>

          <Box flexShrink="0" ml={3}>
            <StepTitle style={{ fontWeight: actualActiveStep === index ? 'bold' : 'normal', color: actualActiveStep === index ? activeStepTextColor : inactiveStepTextColor }}>
              {step.title}
            </StepTitle>
            <StepDescription style={{ color: inactiveStepTextColor }}>
              {step.description}
            </StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressStepper; 