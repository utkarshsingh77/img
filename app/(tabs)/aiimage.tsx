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
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

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

// Grok API configuration
const GROK_API_KEY =
  "xai-mHBFUZoQPDXWaNqiZJcV5O8PNdI1oplTg0c44RWDQECffQAQV862RK74AmUfZh2hgM1NSoktOQhLFyCA";
const GROK_API_URL = "https://api.x.ai/v1/images/generations";

type ImageModel = "dall-e-3" | "gpt-image-1" | "grok-image";
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const viewShotRef = useRef<ViewShot>(null);
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  const animateCard = () => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    // Run animations in parallel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateImageWithGrok = async () => {
    try {
      const response = await fetch(GROK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: imageSize,
          model: "grok-image-latest",
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.[0]?.url || null;
    } catch (error) {
      console.error("Error with Grok API:", error);
      throw error;
    }
  };

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

      let imageUrl = null;

      if (model === "grok-image") {
        // Use Grok for image generation
        imageUrl = await generateImageWithGrok();
      } else if (model === "dall-e-3") {
        // Use DALL-E 3
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        });

        imageUrl = response?.data?.[0]?.url;
      } else if (model === "gpt-image-1") {
        // Use GPT Image
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: prompt,
          n: 1,
          size: imageSize,
          quality: imageQuality,
          background: transparentBackground ? "transparent" : "auto",
        });

        imageUrl = response?.data?.[0]?.url;

        if (!imageUrl) {
          const b64Json = response?.data?.[0]?.b64_json;
          if (b64Json) {
            imageUrl = `data:image/png;base64,${b64Json}`;
          }
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        setRecentPrompts((prev) => [prompt, ...prev.slice(0, 4)]);
        setPrompt("");
        setTimeout(animateCard, 100);
      } else {
        throw new Error(`No image URL returned from ${model}`);
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
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowSettings(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title">Settings</ThemedText>
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <ThemedView style={styles.settingSection}>
                <ThemedText style={styles.settingTitle}>Model</ThemedText>
                <View style={styles.modelSelector}>
                  <TouchableOpacity
                    style={[
                      styles.modelOption,
                      model === "dall-e-3" && styles.modelOptionSelected,
                    ]}
                    onPress={() => toggleModel("dall-e-3")}
                  >
                    <View style={styles.modelContent}>
                      <MaterialCommunityIcons
                        name="image-filter-hdr"
                        size={22}
                        color={
                          model === "dall-e-3"
                            ? "#fff"
                            : Colors[colorScheme ?? "light"].text
                        }
                      />
                      <ThemedText
                        style={[
                          styles.modelText,
                          model === "dall-e-3" && styles.modelTextSelected,
                        ]}
                      >
                        DALL-E 3
                      </ThemedText>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modelOption,
                      model === "gpt-image-1" && styles.modelOptionSelected,
                    ]}
                    onPress={() => toggleModel("gpt-image-1")}
                  >
                    <View style={styles.modelContent}>
                      <MaterialCommunityIcons
                        name="image-edit"
                        size={22}
                        color={
                          model === "gpt-image-1"
                            ? "#fff"
                            : Colors[colorScheme ?? "light"].text
                        }
                      />
                      <ThemedText
                        style={[
                          styles.modelText,
                          model === "gpt-image-1" && styles.modelTextSelected,
                        ]}
                      >
                        GPT Image
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    model === "grok-image" && styles.modelOptionSelected,
                    { marginTop: 10 },
                  ]}
                  onPress={() => toggleModel("grok-image")}
                >
                  <View style={styles.modelContent}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={22}
                      color={
                        model === "grok-image"
                          ? "#fff"
                          : Colors[colorScheme ?? "light"].text
                      }
                    />
                    <ThemedText
                      style={[
                        styles.modelText,
                        model === "grok-image" && styles.modelTextSelected,
                      ]}
                    >
                      Grok Image
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                <ThemedText style={styles.modelDescription}>
                  {model === "dall-e-3"
                    ? "Photorealistic images with precise details."
                    : model === "gpt-image-1"
                    ? "More customizable with transparent backgrounds & aspect ratios."
                    : "Grok Image by xAI - Advanced image creation capabilities."}
                </ThemedText>
              </ThemedView>

              {(model === "gpt-image-1" || model === "grok-image") && (
                <>
                  <ThemedView style={styles.settingSection}>
                    <ThemedText style={styles.settingTitle}>
                      Image Size
                    </ThemedText>
                    <View style={styles.optionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.option,
                          imageSize === "1024x1024" && styles.optionSelected,
                        ]}
                        onPress={() => setImageSize("1024x1024")}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            imageSize === "1024x1024" &&
                              styles.optionTextSelected,
                          ]}
                        >
                          Square
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.option,
                          imageSize === "1024x1536" && styles.optionSelected,
                        ]}
                        onPress={() => setImageSize("1024x1536")}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            imageSize === "1024x1536" &&
                              styles.optionTextSelected,
                          ]}
                        >
                          Portrait
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.option,
                          imageSize === "1536x1024" && styles.optionSelected,
                        ]}
                        onPress={() => setImageSize("1536x1024")}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            imageSize === "1536x1024" &&
                              styles.optionTextSelected,
                          ]}
                        >
                          Landscape
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </ThemedView>

                  {model === "gpt-image-1" && (
                    <>
                      <ThemedView style={styles.settingSection}>
                        <ThemedText style={styles.settingTitle}>
                          Quality
                        </ThemedText>
                        <View style={styles.optionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.option,
                              imageQuality === "low" && styles.optionSelected,
                            ]}
                            onPress={() => setImageQuality("low")}
                          >
                            <ThemedText
                              style={[
                                styles.optionText,
                                imageQuality === "low" &&
                                  styles.optionTextSelected,
                              ]}
                            >
                              Low
                            </ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.option,
                              imageQuality === "medium" &&
                                styles.optionSelected,
                            ]}
                            onPress={() => setImageQuality("medium")}
                          >
                            <ThemedText
                              style={[
                                styles.optionText,
                                imageQuality === "medium" &&
                                  styles.optionTextSelected,
                              ]}
                            >
                              Medium
                            </ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.option,
                              imageQuality === "high" && styles.optionSelected,
                            ]}
                            onPress={() => setImageQuality("high")}
                          >
                            <ThemedText
                              style={[
                                styles.optionText,
                                imageQuality === "high" &&
                                  styles.optionTextSelected,
                              ]}
                            >
                              High
                            </ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.option,
                              imageQuality === "auto" && styles.optionSelected,
                            ]}
                            onPress={() => setImageQuality("auto")}
                          >
                            <ThemedText
                              style={[
                                styles.optionText,
                                imageQuality === "auto" &&
                                  styles.optionTextSelected,
                              ]}
                            >
                              Auto
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                      </ThemedView>

                      <ThemedView style={styles.settingSection}>
                        <View style={styles.settingRow}>
                          <ThemedText style={styles.settingTitle}>
                            Transparent Background
                          </ThemedText>
                          <Switch
                            value={transparentBackground}
                            onValueChange={setTransparentBackground}
                            trackColor={{
                              false: "#ccc",
                              true: Colors[colorScheme ?? "light"].tint,
                            }}
                            thumbColor={
                              Platform.OS === "ios" ? undefined : "#fff"
                            }
                            ios_backgroundColor="#ccc"
                          />
                        </View>
                      </ThemedView>
                    </>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowSettings(false)}
            >
              <ThemedText style={styles.applyButtonText}>
                Apply Settings
              </ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
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
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="image-off" size={40} color="#ff6b6b" />
      <ThemedText style={styles.errorText}>
        {error || "Failed to load image"}
      </ThemedText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => setError(null)}
      >
        <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.modelBadge}
            onPress={() => setShowSettings(true)}
          >
            <MaterialCommunityIcons
              name={
                model === "dall-e-3"
                  ? "image-filter-hdr"
                  : model === "gpt-image-1"
                  ? "image-edit"
                  : "lightning-bolt"
              }
              size={16}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.modelBadgeText}>
              Using{" "}
              {model === "dall-e-3"
                ? "DALL-E 3"
                : model === "gpt-image-1"
                ? "GPT Image"
                : "Grok Image"}
            </ThemedText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={Colors[colorScheme ?? "light"].text}
              style={{ marginLeft: 4, opacity: 0.6 }}
            />
          </TouchableOpacity>

          <View style={styles.promptContainer}>
            <ThemedText style={styles.promptLabel}>
              Enter Your Prompt
            </ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.promptInput,
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
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton,
                { opacity: isGenerating ? 0.7 : 1 },
              ]}
              onPress={generateImage}
              disabled={isGenerating}
              activeOpacity={0.7}
            >
              {isGenerating ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <ThemedText style={styles.generateButtonText}>
                    Creating...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.generateButtonText}>
                  Generate Image
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {recentPrompts.length > 0 && (
            <View style={styles.recentPromptsContainer}>
              <ThemedText style={styles.sectionTitle}>
                Recent Prompts
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentPromptsScroll}
              >
                {recentPrompts.map((recentPrompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentPromptTag}
                    onPress={() => handleRecentPrompt(recentPrompt)}
                    activeOpacity={0.7}
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
            </View>
          )}

          <View style={styles.resultContainer}>
            <ThemedText style={styles.sectionTitle}>Generated Image</ThemedText>

            {error ? (
              <ErrorDisplay />
            ) : isGenerating ? (
              <View style={styles.generatingContainer}>
                <ActivityIndicator
                  size="large"
                  color={Colors[colorScheme ?? "light"].tint}
                />
                <ThemedText style={styles.generatingText}>
                  Creating your image...
                </ThemedText>
              </View>
            ) : generatedImage && isValidImage(generatedImage) ? (
              <Animated.View
                style={[
                  styles.imageCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <ViewShot
                  ref={viewShotRef}
                  options={{ format: "png", quality: 0.9 }}
                >
                  <Image
                    source={{ uri: generatedImage }}
                    style={styles.generatedImage}
                    contentFit="cover"
                    transition={300}
                    onError={() =>
                      setError("Failed to load the generated image.")
                    }
                  />
                </ViewShot>

                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={shareImage}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="share-variant-outline"
                      size={22}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.actionText}>Share</ThemedText>
                  </TouchableOpacity>

                  <View style={styles.actionDivider} />

                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={saveImage}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="content-save-outline"
                      size={22}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.actionText}>Save</ThemedText>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={60}
                  color={Colors[colorScheme ?? "light"].tabIconDefault}
                />
                <ThemedText style={styles.emptyText}>
                  Enter a prompt to generate an image
                </ThemedText>
              </View>
            )}
          </View>

          <View style={{ height: bottom + 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {renderSettingsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 126, 164, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  modelBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  promptContainer: {
    marginBottom: 24,
  },
  promptLabel: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "rgba(10, 126, 164, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.1)",
  },
  promptInput: {
    padding: 14,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 22,
  },
  generateButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  recentPromptsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  recentPromptsScroll: {
    paddingRight: 20,
  },
  recentPromptTag: {
    backgroundColor: "rgba(10, 126, 164, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.1)",
  },
  recentPromptText: {
    fontSize: 13,
    fontWeight: "500",
  },
  resultContainer: {
    marginBottom: 24,
  },
  generatingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    backgroundColor: "rgba(10, 126, 164, 0.04)",
    borderRadius: 16,
    marginBottom: 16,
  },
  generatingText: {
    marginTop: 16,
    fontSize: 15,
    opacity: 0.7,
  },
  imageCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  generatedImage: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageActions: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-around",
  },
  imageActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    backgroundColor: "rgba(10, 126, 164, 0.04)",
    borderRadius: 16,
    paddingHorizontal: 30,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 12,
    backgroundColor: "rgba(255, 100, 100, 0.08)",
    borderRadius: 16,
    marginBottom: 16,
    height: 300,
  },
  errorText: {
    marginVertical: 12,
    textAlign: "center",
    fontSize: 15,
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  modalContent: {
    padding: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modelSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  modelOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  modelOptionSelected: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  modelContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modelText: {
    fontWeight: "600",
    marginLeft: 8,
  },
  modelTextSelected: {
    color: "white",
  },
  modelDescription: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  optionSelected: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  optionText: {
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "white",
  },
  applyButton: {
    backgroundColor: "#0a7ea4",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
