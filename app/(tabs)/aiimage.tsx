import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import OpenAI from "openai";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Initialize OpenAI with your API key
// In a production app, you would store this key securely
// and ideally call the API through a backend service
const openai = new OpenAI({
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});

type ImageModel = "dall-e-3" | "gpt-image-1";
type ImageSize = "1024x1024" | "1024x1536" | "1536x1024" | "auto";
type ImageQuality = "low" | "medium" | "high" | "auto";
type ImageBackground = "transparent" | "auto";

export default function AIImageScreen() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [model, setModel] = useState<ImageModel>("dall-e-3");
  const [showSettings, setShowSettings] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>("1024x1024");
  const [imageQuality, setImageQuality] = useState<ImageQuality>("auto");
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewShotRef = useRef<ViewShot>(null);
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  const generateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert("Please enter a prompt");
      return;
    }

    try {
      // Reset any previous error
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsGenerating(true);
      console.log(`Generating image with model: ${model}`);

      let response;
      if (model === "dall-e-3") {
        console.log("Using DALL-E 3 model with settings:", { prompt });
        response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        });

        const imageUrl = response?.data?.[0]?.url;
        console.log(
          "DALL-E 3 response received, URL:",
          imageUrl ? "URL received" : "No URL in response"
        );
        if (imageUrl) {
          setGeneratedImage(imageUrl);
          setRecentPrompts((prev) => [prompt, ...prev.slice(0, 4)]);
          setPrompt("");
          console.log("Image URL set to state:", imageUrl);
        } else {
          throw new Error("No image URL returned from DALL-E 3");
        }
      } else if (model === "gpt-image-1") {
        console.log("Using GPT Image model with settings:", {
          prompt,
          quality: imageQuality,
          size: imageSize,
          transparentBg: transparentBackground,
        });

        console.log("Making GPT Image API request with params:", {
          model: "gpt-image-1",
          prompt: prompt.substring(0, 20) + (prompt.length > 20 ? "..." : ""),
          size: imageSize,
          quality: imageQuality,
          background: transparentBackground ? "transparent" : "auto",
        });

        // Make the API call with better error handling
        response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: prompt,
          n: 1,
          size: imageSize,
          quality: imageQuality,
          background: transparentBackground ? "transparent" : "auto",
        });

        console.log(
          "Raw GPT Image response:",
          JSON.stringify(response, null, 2)
        );

        // More detailed logging of the response structure
        if (response) {
          console.log("Response type:", typeof response);
          if (response.data) {
            console.log("Data array length:", response.data.length);
            console.log(
              "First data item keys:",
              response.data[0] ? Object.keys(response.data[0]) : "no data items"
            );
          }
        }

        // Check for the URL in the expected location
        const imageUrl = response?.data?.[0]?.url;
        if (imageUrl) {
          console.log("Image URL found:", imageUrl.substring(0, 30) + "...");
          setGeneratedImage(imageUrl);
          setRecentPrompts((prev) => [prompt, ...prev.slice(0, 4)]);
          setPrompt("");
        } else {
          // More detailed error with full response inspection
          console.error(
            "No URL found in response. Full response:",
            JSON.stringify(response)
          );

          // Check for revised prompt or other alternative fields
          const revisedPrompt = response?.data?.[0]?.revised_prompt;
          const b64Json = response?.data?.[0]?.b64_json;

          if (revisedPrompt) {
            console.log("Response contains revised_prompt but no URL");
            throw new Error(
              "GPT Image model returned a revised prompt but no image URL"
            );
          } else if (b64Json) {
            console.log("Found b64_json instead of URL, setting as data URL");
            setGeneratedImage(`data:image/png;base64,${b64Json}`);
            setRecentPrompts((prev) => [prompt, ...prev.slice(0, 4)]);
            setPrompt("");
          } else {
            throw new Error("No image data returned from GPT Image");
          }
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate image. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareImage = async () => {
    if (!generatedImage || !viewShotRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const uri = await viewShotRef.current?.capture?.();

      if (!uri) {
        throw new Error("Failed to capture image");
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing not available");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share image");
    }
  };

  const saveImage = async () => {
    if (!generatedImage || !viewShotRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // First capture the image from ViewShot
      const uri = await viewShotRef.current?.capture?.();

      if (!uri) {
        throw new Error("Failed to capture image");
      }

      // Save to media library using Expo sharing
      if (Platform.OS === "ios") {
        // On iOS, use sharing to save to camera roll
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Save AI-Generated Image",
            UTI: "public.png",
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      } else {
        // On Android, save directly to file system
        const fileUri = `${
          FileSystem.documentDirectory
        }ai-image-${Date.now()}.png`;
        await FileSystem.copyAsync({
          from: uri,
          to: fileUri,
        });
        Alert.alert("Success", "Image saved to your device");
      }
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image");
    }
  };

  const handleRecentPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const toggleModel = (newModel: ImageModel) => {
    setModel(newModel);
  };

  const renderSettingsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
            },
          ]}
        >
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title">Image Settings</ThemedText>

            <ThemedView style={styles.settingItem}>
              <ThemedText type="subtitle">Model</ThemedText>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.modelButton,
                    model === "dall-e-3" && styles.selectedButton,
                    { marginRight: 8 },
                  ]}
                  onPress={() => toggleModel("dall-e-3")}
                >
                  <View style={styles.modelButtonContent}>
                    <MaterialCommunityIcons
                      name="image-filter-hdr"
                      size={24}
                      color={
                        model === "dall-e-3"
                          ? "white"
                          : Colors[colorScheme ?? "light"].text
                      }
                    />
                    <ThemedText
                      style={[
                        styles.modelButtonText,
                        model === "dall-e-3" && styles.selectedText,
                      ]}
                    >
                      DALL-E 3
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modelButton,
                    model === "gpt-image-1" && styles.selectedButton,
                    { marginLeft: 8 },
                  ]}
                  onPress={() => toggleModel("gpt-image-1")}
                >
                  <View style={styles.modelButtonContent}>
                    <MaterialCommunityIcons
                      name="image-edit"
                      size={24}
                      color={
                        model === "gpt-image-1"
                          ? "white"
                          : Colors[colorScheme ?? "light"].text
                      }
                    />
                    <ThemedText
                      style={[
                        styles.modelButtonText,
                        model === "gpt-image-1" && styles.selectedText,
                      ]}
                    >
                      GPT Image
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.modelDescription}>
                {model === "dall-e-3"
                  ? "DALL-E 3 creates detailed, photorealistic images from text descriptions. Best for high-quality single images with precise details. Limited customization options."
                  : "GPT Image offers transparent backgrounds, multiple aspect ratios, and quality settings. More versatile with modern style. Customize settings below."}
              </ThemedText>
            </ThemedView>

            {model === "gpt-image-1" && (
              <>
                <ThemedView style={styles.settingItem}>
                  <ThemedText type="subtitle">Image Size</ThemedText>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[
                        styles.sizeButton,
                        imageSize === "1024x1024" && styles.selectedButton,
                      ]}
                      onPress={() => setImageSize("1024x1024")}
                    >
                      <ThemedText
                        style={imageSize === "1024x1024" && styles.selectedText}
                      >
                        Square
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.sizeButton,
                        imageSize === "1024x1536" && styles.selectedButton,
                      ]}
                      onPress={() => setImageSize("1024x1536")}
                    >
                      <ThemedText
                        style={imageSize === "1024x1536" && styles.selectedText}
                      >
                        Portrait
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.sizeButton,
                        imageSize === "1536x1024" && styles.selectedButton,
                      ]}
                      onPress={() => setImageSize("1536x1024")}
                    >
                      <ThemedText
                        style={imageSize === "1536x1024" && styles.selectedText}
                      >
                        Landscape
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedView>

                <ThemedView style={styles.settingItem}>
                  <ThemedText type="subtitle">Quality</ThemedText>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[
                        styles.qualityButton,
                        imageQuality === "low" && styles.selectedButton,
                      ]}
                      onPress={() => setImageQuality("low")}
                    >
                      <ThemedText
                        style={imageQuality === "low" && styles.selectedText}
                      >
                        Low
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.qualityButton,
                        imageQuality === "medium" && styles.selectedButton,
                      ]}
                      onPress={() => setImageQuality("medium")}
                    >
                      <ThemedText
                        style={imageQuality === "medium" && styles.selectedText}
                      >
                        Medium
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.qualityButton,
                        imageQuality === "high" && styles.selectedButton,
                      ]}
                      onPress={() => setImageQuality("high")}
                    >
                      <ThemedText
                        style={imageQuality === "high" && styles.selectedText}
                      >
                        High
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.qualityButton,
                        imageQuality === "auto" && styles.selectedButton,
                      ]}
                      onPress={() => setImageQuality("auto")}
                    >
                      <ThemedText
                        style={imageQuality === "auto" && styles.selectedText}
                      >
                        Auto
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedView>

                <ThemedView style={styles.settingItem}>
                  <ThemedText type="subtitle">
                    Transparent Background
                  </ThemedText>
                  <Switch
                    value={transparentBackground}
                    onValueChange={setTransparentBackground}
                    trackColor={{
                      false: "#767577",
                      true: Colors[colorScheme ?? "light"].tint,
                    }}
                  />
                </ThemedView>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.generateButton,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
              ]}
              onPress={() => setShowSettings(false)}
            >
              <ThemedText style={styles.generateButtonText}>
                Apply Settings
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    );
  };

  const isValidImage = (url: string | null): boolean => {
    if (!url) return false;

    // Check if it's a valid URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return true;
    }

    // Check if it's a valid data URI
    if (url.startsWith("data:image/")) {
      return true;
    }

    return false;
  };

  const ErrorDisplay = () => (
    <ThemedView style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="image-off"
        size={40}
        color={Colors[colorScheme ?? "light"].tabIconDefault}
      />
      <ThemedText style={styles.errorText}>
        {error || "Failed to load image"}
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.generateButton,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
        ]}
        onPress={() => setError(null)}
      >
        <ThemedText style={styles.generateButtonText}>Try Again</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedView style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <ThemedText type="title">AI Image Generator</ThemedText>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowSettings(true)}
              >
                <MaterialCommunityIcons
                  name="cog"
                  size={24}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modelBadge}
              onPress={() => setShowSettings(true)}
            >
              <MaterialCommunityIcons
                name={model === "dall-e-3" ? "image-filter-hdr" : "image-edit"}
                size={18}
                color={Colors[colorScheme ?? "light"].tint}
                style={styles.modelBadgeIcon}
              />
              <ThemedText style={styles.modelBadgeText}>
                Using {model === "dall-e-3" ? "DALL-E 3" : "GPT Image"}
              </ThemedText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={14}
                color={Colors[colorScheme ?? "light"].text}
                style={{ marginLeft: 4, opacity: 0.5 }}
              />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.formContainer}>
            <ThemedText type="subtitle">Enter Your Prompt</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
                placeholder="Describe the image you want to create..."
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].tabIconDefault
                }
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
              ]}
              onPress={generateImage}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.generateButtonText}>
                  Generate Image
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          {recentPrompts.length > 0 && (
            <ThemedView style={styles.recentPromptsContainer}>
              <ThemedText type="subtitle">Recent Prompts</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentPrompts.map((recentPrompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentPromptBadge}
                    onPress={() => handleRecentPrompt(recentPrompt)}
                  >
                    <ThemedText
                      numberOfLines={1}
                      style={styles.recentPromptText}
                    >
                      {recentPrompt}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          <ThemedView style={styles.resultContainer}>
            <ThemedText type="subtitle">Generated Image</ThemedText>

            {error ? (
              <ErrorDisplay />
            ) : isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={Colors[colorScheme ?? "light"].tint}
                />
                <ThemedText style={styles.loadingText}>
                  Generating image...
                </ThemedText>
              </View>
            ) : generatedImage && isValidImage(generatedImage) ? (
              <>
                <ViewShot
                  ref={viewShotRef}
                  options={{ format: "png", quality: 0.9 }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: generatedImage }}
                      style={styles.generatedImage}
                      contentFit="cover"
                      transition={300}
                      onError={(error) => {
                        console.error("Image loading error:", error);
                        setError("Failed to load the generated image.");
                      }}
                    />
                  </View>
                </ViewShot>

                <View style={styles.imageActionsContainer}>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={shareImage}
                  >
                    <MaterialCommunityIcons
                      name="share-variant"
                      size={20}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.imageActionText}>
                      Share
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={saveImage}
                  >
                    <MaterialCommunityIcons
                      name="content-save"
                      size={20}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.imageActionText}>Save</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={60}
                  color={Colors[colorScheme ?? "light"].tabIconDefault}
                />
                <ThemedText style={styles.emptyText}>
                  Enter a prompt and generate your first image
                </ThemedText>
              </View>
            )}
          </ThemedView>

          <View style={{ height: bottom + 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {renderSettingsModal()}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modelBadge: {
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.2)",
  },
  modelBadgeIcon: {
    marginRight: 6,
  },
  modelBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.tint,
  },
  settingsButton: {
    padding: 8,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  generateButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  recentPromptsContainer: {
    marginBottom: 24,
  },
  recentPromptBadge: {
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
    maxWidth: 200,
  },
  recentPromptText: {
    fontSize: 12,
  },
  resultContainer: {
    marginBottom: 24,
  },
  imageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generatedImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  imageActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  imageActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  imageActionText: {
    marginLeft: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  qualityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedButton: {
    backgroundColor: "rgba(10, 126, 164, 0.8)",
  },
  selectedText: {
    color: "white",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 12,
    backgroundColor: "rgba(255, 100, 100, 0.1)",
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    marginVertical: 10,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 126, 164, 0.05)",
    borderRadius: 12,
    padding: 30,
    marginTop: 12,
    height: 300,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 126, 164, 0.05)",
    borderRadius: 12,
    padding: 30,
    marginTop: 12,
    height: 300,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  modelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flex: 1,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modelButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modelButtonText: {
    fontWeight: "600",
    marginLeft: 10,
    fontSize: 14,
  },
  modelDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 10,
    paddingHorizontal: 4,
    lineHeight: 18,
  },
});
