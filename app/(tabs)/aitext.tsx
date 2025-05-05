import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import OpenAI from "openai";
import React, { useState } from "react";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

type TextModel = "gpt-4o" | "gpt-3.5-turbo" | "grok-3";
type ContentType = "tweet" | "joke" | "fact" | "custom";

export default function AITextScreen() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [model, setModel] = useState<TextModel>("gpt-3.5-turbo");
  const [contentType, setContentType] = useState<ContentType>("tweet");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
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

  const getContentTypePrompt = (userPrompt: string) => {
    switch (contentType) {
      case "tweet":
        return `Write a Twitter/X post (max 280 characters) about: ${userPrompt}. Make it engaging and shareable.`;
      case "joke":
        return `Write a short joke about: ${userPrompt}. Keep it clean and clever.`;
      case "fact":
        return `Share a brief educational fact about: ${userPrompt}. Make it interesting and informative.`;
      case "custom":
        return userPrompt;
      default:
        return userPrompt;
    }
  };

  const generateTextWithGrok = async (formattedPrompt: string) => {
    try {
      const response = await fetch(GROK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You generate short-form content that is concise, creative, and engaging.",
            },
            { role: "user", content: formattedPrompt },
          ],
          model: "grok-3-latest",
          stream: false,
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content;
    } catch (error) {
      console.error("Error with Grok API:", error);
      throw error;
    }
  };

  const generateText = async () => {
    if (!prompt.trim()) {
      Alert.alert("Please enter a prompt");
      return;
    }

    try {
      // Reset any previous error
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsGenerating(true);

      const formattedPrompt = getContentTypePrompt(prompt);
      let generatedContent;

      if (model === "grok-3") {
        // Use Grok API
        generatedContent = await generateTextWithGrok(formattedPrompt);
      } else {
        // Use OpenAI API
        const response = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content:
                "You generate short-form content that is concise, creative, and engaging.",
            },
            { role: "user", content: formattedPrompt },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        generatedContent = response.choices[0]?.message?.content;
      }

      if (generatedContent) {
        setGeneratedText(generatedContent.trim());
        setRecentPrompts((prev) => [prompt, ...prev.slice(0, 4)]);
        setPrompt("");
        setTimeout(animateCard, 100);
      } else {
        throw new Error("No text content returned from the API");
      }
    } catch (error) {
      console.error("Error generating text:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate text. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedText) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Clipboard.setStringAsync(generatedText);
      Alert.alert("Copied to clipboard!");
    } catch (error) {
      console.error("Error copying text:", error);
      Alert.alert("Error", "Failed to copy text");
    }
  };

  const handleRecentPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const toggleModel = (newModel: TextModel) => {
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
                      model === "gpt-4o" && styles.modelOptionSelected,
                    ]}
                    onPress={() => toggleModel("gpt-4o")}
                  >
                    <View style={styles.modelContent}>
                      <MaterialCommunityIcons
                        name="robot"
                        size={22}
                        color={
                          model === "gpt-4o"
                            ? "#fff"
                            : Colors[colorScheme ?? "light"].text
                        }
                      />
                      <ThemedText
                        style={[
                          styles.modelText,
                          model === "gpt-4o" && styles.modelTextSelected,
                        ]}
                      >
                        GPT-4o
                      </ThemedText>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modelOption,
                      model === "gpt-3.5-turbo" && styles.modelOptionSelected,
                    ]}
                    onPress={() => toggleModel("gpt-3.5-turbo")}
                  >
                    <View style={styles.modelContent}>
                      <MaterialCommunityIcons
                        name="robot-outline"
                        size={22}
                        color={
                          model === "gpt-3.5-turbo"
                            ? "#fff"
                            : Colors[colorScheme ?? "light"].text
                        }
                      />
                      <ThemedText
                        style={[
                          styles.modelText,
                          model === "gpt-3.5-turbo" && styles.modelTextSelected,
                        ]}
                      >
                        GPT-3.5 Turbo
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    model === "grok-3" && styles.modelOptionSelected,
                    { marginTop: 10 },
                  ]}
                  onPress={() => toggleModel("grok-3")}
                >
                  <View style={styles.modelContent}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={22}
                      color={
                        model === "grok-3"
                          ? "#fff"
                          : Colors[colorScheme ?? "light"].text
                      }
                    />
                    <ThemedText
                      style={[
                        styles.modelText,
                        model === "grok-3" && styles.modelTextSelected,
                      ]}
                    >
                      Grok-3
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                <ThemedText style={styles.modelDescription}>
                  {model === "gpt-4o"
                    ? "More capable for complex and creative content."
                    : model === "gpt-3.5-turbo"
                    ? "Faster and more efficient for simple content generation."
                    : "Grok-3 by xAI - Innovative AI with advanced reasoning abilities."}
                </ThemedText>
              </ThemedView>
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

  const ErrorDisplay = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="alert-circle" size={40} color="#ff6b6b" />
      <ThemedText style={styles.errorText}>
        {error || "Failed to generate text"}
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
          <View style={styles.header}>
            <ThemedText style={styles.title}>AI Text Generator</ThemedText>
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
              name={
                model === "gpt-4o"
                  ? "robot"
                  : model === "gpt-3.5-turbo"
                  ? "robot-outline"
                  : "lightning-bolt"
              }
              size={16}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.modelBadgeText}>
              Using{" "}
              {model === "gpt-4o"
                ? "GPT-4o"
                : model === "gpt-3.5-turbo"
                ? "GPT-3.5 Turbo"
                : "Grok-3"}
            </ThemedText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={Colors[colorScheme ?? "light"].text}
              style={{ marginLeft: 4, opacity: 0.6 }}
            />
          </TouchableOpacity>

          <View style={styles.contentTypeContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contentTypeScroll}
            >
              <TouchableOpacity
                style={[
                  styles.contentTypeButton,
                  contentType === "tweet" && styles.contentTypeSelected,
                ]}
                onPress={() => setContentType("tweet")}
              >
                <MaterialCommunityIcons
                  name="twitter"
                  size={18}
                  color={
                    contentType === "tweet"
                      ? "#fff"
                      : Colors[colorScheme ?? "light"].text
                  }
                />
                <ThemedText
                  style={[
                    styles.contentTypeText,
                    contentType === "tweet" && styles.contentTypeTextSelected,
                  ]}
                >
                  Tweet
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.contentTypeButton,
                  contentType === "joke" && styles.contentTypeSelected,
                ]}
                onPress={() => setContentType("joke")}
              >
                <MaterialCommunityIcons
                  name="emoticon-happy"
                  size={18}
                  color={
                    contentType === "joke"
                      ? "#fff"
                      : Colors[colorScheme ?? "light"].text
                  }
                />
                <ThemedText
                  style={[
                    styles.contentTypeText,
                    contentType === "joke" && styles.contentTypeTextSelected,
                  ]}
                >
                  Joke
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.contentTypeButton,
                  contentType === "fact" && styles.contentTypeSelected,
                ]}
                onPress={() => setContentType("fact")}
              >
                <MaterialCommunityIcons
                  name="lightbulb"
                  size={18}
                  color={
                    contentType === "fact"
                      ? "#fff"
                      : Colors[colorScheme ?? "light"].text
                  }
                />
                <ThemedText
                  style={[
                    styles.contentTypeText,
                    contentType === "fact" && styles.contentTypeTextSelected,
                  ]}
                >
                  Fact
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.contentTypeButton,
                  contentType === "custom" && styles.contentTypeSelected,
                ]}
                onPress={() => setContentType("custom")}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color={
                    contentType === "custom"
                      ? "#fff"
                      : Colors[colorScheme ?? "light"].text
                  }
                />
                <ThemedText
                  style={[
                    styles.contentTypeText,
                    contentType === "custom" && styles.contentTypeTextSelected,
                  ]}
                >
                  Custom
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.promptContainer}>
            <ThemedText style={styles.promptLabel}>
              {contentType === "custom"
                ? "Enter Your Prompt"
                : `${
                    contentType.charAt(0).toUpperCase() + contentType.slice(1)
                  } Topic`}
            </ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.promptInput,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
                placeholder={
                  contentType === "tweet"
                    ? "What would you like a tweet about?"
                    : contentType === "joke"
                    ? "What topic would you like a joke about?"
                    : contentType === "fact"
                    ? "What topic would you like to learn about?"
                    : "Describe what you want to generate..."
                }
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
              onPress={generateText}
              disabled={isGenerating}
              activeOpacity={0.7}
            >
              {isGenerating ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <ThemedText style={styles.generateButtonText}>
                    Generating...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.generateButtonText}>
                  {`Generate ${
                    contentType === "custom"
                      ? "Text"
                      : contentType.charAt(0).toUpperCase() +
                        contentType.slice(1)
                  }`}
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
            <ThemedText style={styles.sectionTitle}>Generated Text</ThemedText>

            {error ? (
              <ErrorDisplay />
            ) : isGenerating ? (
              <View style={styles.generatingContainer}>
                <ActivityIndicator
                  size="large"
                  color={Colors[colorScheme ?? "light"].tint}
                />
                <ThemedText style={styles.generatingText}>
                  Creating your content...
                </ThemedText>
              </View>
            ) : generatedText ? (
              <Animated.View
                style={[
                  styles.textCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <ThemedText style={styles.generatedText}>
                  {generatedText}
                </ThemedText>

                <View style={styles.textActions}>
                  <TouchableOpacity
                    style={styles.textActionButton}
                    onPress={copyToClipboard}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="content-copy"
                      size={22}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.actionText}>Copy</ThemedText>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="text-box-plus"
                  size={60}
                  color={Colors[colorScheme ?? "light"].tabIconDefault}
                />
                <ThemedText style={styles.emptyText}>
                  Enter a prompt to generate text
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  settingsButton: {
    padding: 8,
  },
  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 126, 164, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  modelBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  contentTypeContainer: {
    marginBottom: 20,
  },
  contentTypeScroll: {
    paddingRight: 20,
  },
  contentTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.1)",
  },
  contentTypeSelected: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  contentTypeText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  contentTypeTextSelected: {
    color: "white",
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
    height: 200,
    backgroundColor: "rgba(10, 126, 164, 0.04)",
    borderRadius: 16,
    marginBottom: 16,
  },
  generatingText: {
    marginTop: 16,
    fontSize: 15,
    opacity: 0.7,
  },
  textCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
  },
  generatedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  textActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  textActionButton: {
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
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
    height: 200,
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
