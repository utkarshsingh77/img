import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { checkEnvVars } from "@/config/env";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { replicateService } from "@/services/replicateService";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  onCancel: () => void;
}

export function ImageGenerator({
  onImageGenerated,
  onCancel,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const colorScheme = useColorScheme();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Please enter a prompt");
      return;
    }

    // Check if environment variables are set
    if (!checkEnvVars()) {
      Alert.alert(
        "API Token Missing",
        "Please check the API token configuration."
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setGenerating(true);
      setGenerationStatus("Initializing generation...");
      setAttemptCount(0);

      // Setup polling for status updates
      const statusInterval = setInterval(() => {
        setAttemptCount((prev) => {
          const newCount = prev + 1;
          if (newCount % 5 === 0) {
            setGenerationStatus(
              `Still working on your image... (${Math.floor(newCount / 5)}0%)`
            );
          }
          return newCount;
        });
      }, 1000);

      try {
        // More informative status messages
        setGenerationStatus("Connecting to Replicate API...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setGenerationStatus("Preparing image generation...");
        const imageUrl = await replicateService.generateImage(prompt);

        // Clear the interval
        clearInterval(statusInterval);

        // Pause briefly to show success state
        setGenerationStatus("Image generated successfully!");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Pass the image URL and prompt back to the parent component
        onImageGenerated(imageUrl, prompt);

        // Reset the prompt
        setPrompt("");
      } catch (error: any) {
        // Clear the interval
        clearInterval(statusInterval);

        console.error("Error generating image:", error);

        // Extract the detailed error if possible
        let errorMessage = "Failed to generate image. Please try again.";
        try {
          if (error.message && error.message.includes("API error")) {
            const errorText = error.message.replace("API error: ", "");
            const apiError = JSON.parse(errorText);

            if (apiError.detail) {
              errorMessage =
                typeof apiError.detail === "string"
                  ? apiError.detail
                  : JSON.stringify(apiError.detail);
            } else if (apiError.title) {
              errorMessage = apiError.title;
            }

            // Add API status code if available
            if (apiError.status) {
              errorMessage += ` (Status: ${apiError.status})`;
            }
          } else {
            errorMessage = error.message || errorMessage;
          }
        } catch (e) {
          console.log("Error parsing error message:", e);
        }

        Alert.alert("Error", errorMessage);
      }
    } finally {
      setGenerating(false);
      setGenerationStatus("");
      setAttemptCount(0);
    }
  };

  // Calculate the estimated time
  const getEstimatedTime = () => {
    return attemptCount > 0
      ? `Estimated time remaining: ~${Math.max(
          15 - Math.floor(attemptCount / 5),
          1
        )} seconds`
      : "Image generation typically takes 10-20 seconds";
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Create New AI Image</ThemedText>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.closeButton}
          disabled={generating}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={
              generating
                ? Colors[colorScheme ?? "light"].tabIconDefault
                : Colors[colorScheme ?? "light"].text
            }
          />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Prompt</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
          placeholder="Describe the image you want to create in detail..."
          placeholderTextColor={Colors[colorScheme ?? "light"].tabIconDefault}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={3}
          editable={!generating}
        />
      </ThemedView>

      <ThemedText style={styles.modelInfo}>
        Using flux-schnell model • Fast mode enabled • 1:1 aspect ratio
      </ThemedText>

      {generating && generationStatus && (
        <ThemedView style={styles.statusContainer}>
          <ActivityIndicator
            size="small"
            color={Colors[colorScheme ?? "light"].tint}
            style={styles.statusSpinner}
          />
          <View style={styles.statusTextContainer}>
            <ThemedText style={styles.statusText}>
              {generationStatus}
            </ThemedText>
            <ThemedText style={styles.statusSubtext}>
              {getEstimatedTime()}
            </ThemedText>
          </View>
        </ThemedView>
      )}

      <TouchableOpacity
        style={[
          styles.generateButton,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
          generating && styles.buttonDisabled,
        ]}
        onPress={handleGenerate}
        disabled={generating}
      >
        {generating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons
              name="palette"
              size={18}
              color="#fff"
              style={styles.buttonIcon}
            />
            <ThemedText style={styles.buttonText}>Generate Image</ThemedText>
          </View>
        )}
      </TouchableOpacity>

      {!generating && (
        <ThemedText style={styles.disclaimer}>
          Using Flux Schnell model with fast generation mode
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  modelInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 12,
    borderRadius: 8,
  },
  statusSpinner: {
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  generateButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  disclaimer: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 12,
    textAlign: "center",
  },
});
