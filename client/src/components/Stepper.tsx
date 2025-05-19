import React from "react";
import {
    Box,
    Stepper,
    Step,
    StepIndicator,
    StepStatus,
    StepTitle,
    StepDescription,
    StepSeparator,
    useColorModeValue,
    Icon,
    Spinner,
    Circle,
    Text,
} from "@chakra-ui/react";
import { CheckIcon, WarningIcon } from "@chakra-ui/icons";

const steps = [
    { title: "Device Connected", description: "Wearable linked" },
    { title: "Health Data Obtained", description: "Syncing data" },
    { title: "Archetype Discovered", description: "Generating vibe" },
    { title: "Data Cleared", description: "Session wiped" },
];

export type StepStatusType = "idle" | "ongoing" | "complete" | "error";

interface ProgressStepperProps {
    stepStatuses: StepStatusType[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
    stepStatuses,
}) => {
    const activeStepIndex = stepStatuses.findIndex(
        (status) => status === "ongoing"
    );

    const completedColor = useColorModeValue("teal.500", "teal.300");
    const ongoingColor = useColorModeValue("teal.500", "teal.300");
    const errorColor = useColorModeValue("red.500", "red.300");
    const pendingColor = useColorModeValue("gray.400", "gray.600");

    const titleColorCompleted = useColorModeValue("gray.800", "gray.100");
    const titleColorActive = useColorModeValue("gray.800", "gray.100");
    const titleColorPending = useColorModeValue("gray.600", "gray.400");

    const descriptionColor = useColorModeValue("gray.600", "gray.400");

    return (
        <Stepper
            index={activeStepIndex}
            orientation="vertical"
            height={`${steps.length * 70}px`}
            gap="0"
        >
            {steps.map((step, index) => {
                const status = stepStatuses[index];
                const isCompleted = status === "complete";
                const isOngoing = status === "ongoing";
                const isError = status === "error";

                return (
                    <Step key={index}>
                        <StepIndicator>
                            <StepStatus
                                complete={
                                    <Circle
                                        size="6"
                                        bg={completedColor}
                                        color="white"
                                    >
                                        <Icon as={CheckIcon} boxSize="3" />
                                    </Circle>
                                }
                                incomplete={
                                    isError ? (
                                        <Icon
                                            as={WarningIcon}
                                            color={errorColor}
                                            boxSize="6"
                                        />
                                    ) : (
                                        <Circle
                                            size="6"
                                            borderWidth="2px"
                                            borderColor={pendingColor}
                                            bg="transparent"
                                        ></Circle>
                                    )
                                }
                                active={
                                    isOngoing ? (
                                        <Spinner
                                            size="sm"
                                            color={ongoingColor}
                                        />
                                    ) : isError ? (
                                        <Icon
                                            as={WarningIcon}
                                            color={errorColor}
                                            boxSize="6"
                                        />
                                    ) : isCompleted ? (
                                        <Circle
                                            size="6"
                                            bg={completedColor}
                                            color="white"
                                        >
                                            <Icon as={CheckIcon} boxSize="3" />
                                        </Circle>
                                    ) : (
                                        <Circle
                                            size="6"
                                            borderWidth="2px"
                                            borderColor={pendingColor}
                                            bg="transparent"
                                        ></Circle>
                                    )
                                }
                            />
                        </StepIndicator>

                        <Box flexShrink="0" ml={3}>
                            <StepTitle>
                                <Text
                                    color={
                                        isCompleted
                                            ? titleColorCompleted
                                            : isOngoing
                                            ? titleColorActive
                                            : titleColorPending
                                    }
                                    fontWeight={
                                        isOngoing
                                            ? "bold"
                                            : isCompleted
                                            ? "bold"
                                            : "normal"
                                    }
                                >
                                    {step.title}
                                </Text>
                            </StepTitle>
                            <StepDescription>
                                <Text
                                    color={descriptionColor}
                                    fontWeight="normal"
                                >
                                    {step.description}
                                </Text>
                            </StepDescription>
                        </Box>

                        <StepSeparator />
                    </Step>
                );
            })}
        </Stepper>
    );
};

export default ProgressStepper;
