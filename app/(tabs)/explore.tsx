import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ImageGenerator } from "@/components/ImageGenerator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Sample data for the AI images feed
// In a real app, this would come from a backend API
const SAMPLE_IMAGES = [
  {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1000",
    prompt:
      "A majestic white wolf with piercing blue eyes standing in a snowy landscape at dusk",
    model: "DALL-E 3",
    likes: 423,
    username: "skyartist",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000",
    prompt:
      "Ancient library with ornate architecture, tall bookshelves, and a magical atmosphere with light beaming through windows",
    model: "DALL-E 3",
    likes: 519,
    username: "cosmic_scholar",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    imageUrl:
      "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1000",
    prompt:
      "Detailed macro photograph of intricate watch mechanism with gears and springs visible in perfect detail",
    model: "GPT Image",
    likes: 352,
    username: "micro_worlds",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000",
    prompt:
      "Portrait of a regal cat with orange eyes against dark background, captured with studio lighting",
    model: "DALL-E 3",
    likes: 783,
    username: "art_historian",
    timestamp: "3 days ago",
  },
  {
    id: "5",
    imageUrl:
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000",
    prompt:
      "Towering redwood trees in a misty forest, sun rays filtering through the canopy and creating dreamlike atmosphere",
    model: "GPT Image",
    likes: 672,
    username: "nature_tech",
    timestamp: "4 days ago",
  },
  {
    id: "6",
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000",
    prompt:
      "Underwater scene with vibrant coral reef and colorful tropical fish in crystal clear blue water",
    model: "DALL-E 3",
    likes: 492,
    username: "dream_diver",
    timestamp: "5 days ago",
  },
  {
    id: "7",
    imageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
    prompt:
      "Night sky filled with stars and the Milky Way galaxy, viewed from a mountain peak",
    model: "GPT Image",
    likes: 327,
    username: "star_gazer",
    timestamp: "1 week ago",
  },
];

export default function ExploreScreen() {
  const [images, setImages] = useState(SAMPLE_IMAGES);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
  const [showGenerator, setShowGenerator] = useState(false);
  const colorScheme = useColorScheme();
  const { top, bottom } = useSafeAreaInsets();
  const windowWidth = Dimensions.get("window").width;

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would fetch new data here
    // Simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const loadMoreImages = async () => {
    if (loading) return;
    setLoading(true);
    // In a real app, you would fetch more data here
    // Simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Add more images by duplicating existing ones with new IDs
    const moreImages = images.map((item, index) => ({
      ...item,
      id: `new-${index}-${Date.now()}`,
      timestamp: "Just now",
    }));
    setImages([...images, ...moreImages.slice(0, 3)]);
    setLoading(false);
  };

  const toggleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    // Add the new image to the top of the feed
    const newImage = {
      id: `gen-${Date.now()}`,
      imageUrl,
      prompt,
      model: "Flux Schnell",
      likes: 0,
      username: "you", // In a real app, this would be the user's username
      timestamp: "Just now",
    };

    setImages([newImage, ...images]);
    setShowGenerator(false);

    // Show success notification
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show toast notification
    Alert.alert(
      "Image Created",
      "Your AI-generated image has been added to your feed!",
      [{ text: "OK" }],
      { cancelable: true }
    );
  };

  const renderImageCard = ({ item }: { item: (typeof SAMPLE_IMAGES)[0] }) => {
    const isLiked = liked[item.id] || false;

    return (
      <ThemedView style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={styles.username}>{item.username}</ThemedText>
              <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
            </View>
          </View>
          <View style={styles.modelBadge}>
            <MaterialCommunityIcons
              name={
                item.model === "Flux Schnell"
                  ? "palette"
                  : item.model === "DALL-E 3"
                  ? "image-filter-hdr"
                  : "image-edit"
              }
              size={item.model === "DALL-E 3" ? 16 : 14}
              color={item.model === "DALL-E 3" ? "#333" : "#333"}
              style={styles.modelBadgeIcon}
            />
            <ThemedText
              style={[
                styles.modelBadgeText,
                { color: item.model === "DALL-E 3" ? "#333" : "#333" },
              ]}
            >
              {item.model}
            </ThemedText>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => toggleLike(item.id)}
          >
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#FF4757" : Colors[colorScheme ?? "light"].text}
            />
            <ThemedText style={styles.likeCount}>
              {isLiked ? item.likes + 1 : item.likes}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={22}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={22}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.promptContainer}>
          <ThemedText style={styles.prompt}>
            &ldquo;{item.prompt}&rdquo;
          </ThemedText>
        </View>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="default" />
      <ThemedView style={[styles.header, { paddingTop: top ? top : 48 }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          Explore
        </ThemedText>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowGenerator(true)}
        >
          <View style={styles.createButtonContent}>
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
            <ThemedText style={styles.createButtonText}>Create</ThemedText>
          </View>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={images}
        renderItem={renderImageCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors[colorScheme ?? "light"].tint}
            colors={[Colors[colorScheme ?? "light"].tint]}
          />
        }
        onEndReached={loadMoreImages}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme ?? "light"].tint}
              />
              <ThemedText style={styles.loadingText}>
                Loading more...
              </ThemedText>
            </View>
          ) : null
        }
      />

      {/* Image Generator Modal */}
      <Modal
        visible={showGenerator}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!loading) {
            setShowGenerator(false);
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
          >
            <ImageGenerator
              onImageGenerated={handleImageGenerated}
              onCancel={() => {
                if (!loading) {
                  setShowGenerator(false);
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  createButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A7EA4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  modelBadge: {
    backgroundColor: "rgba(230, 240, 245, 1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  modelBadgeIcon: {
    marginRight: 5,
  },
  modelBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  imageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    width: "100%",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
  },
  likeCount: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "500",
  },
  actionButton: {
    marginRight: 30,
  },
  promptContainer: {
    marginTop: 6,
  },
  prompt: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
    opacity: 0.85,
  },
  loadingFooter: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
