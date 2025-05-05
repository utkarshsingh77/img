import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      "https://cdn.openai.com/labs/images/A%20photo%20of%20a%20white%20fur%20monster%20standing%20in%20a%20purple%20room.webp?v=1",
    prompt: "A photo of a white fur monster standing in a purple room",
    model: "DALL-E 3",
    likes: 42,
    username: "creative_ai",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    imageUrl:
      "https://cdn.openai.com/labs/images/An%20astronaut%20riding%20a%20green%20horse.webp?v=1",
    prompt: "An astronaut riding a green horse",
    model: "GPT Image",
    likes: 128,
    username: "space_explorer",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    imageUrl:
      "https://cdn.openai.com/labs/images/A%20bowl%20of%20soup%20that%20looks%20like%20a%20monster.webp?v=1",
    prompt: "A bowl of soup that looks like a monster",
    model: "DALL-E 3",
    likes: 89,
    username: "food_artist",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    imageUrl:
      "https://cdn.openai.com/labs/images/A%20photo%20of%20a%20teddy%20bear%20on%20a%20skateboard%20in%20Times%20Square.webp?v=1",
    prompt: "A photo of a teddy bear on a skateboard in Times Square",
    model: "GPT Image",
    likes: 213,
    username: "urban_dreamer",
    timestamp: "2 days ago",
  },
  {
    id: "5",
    imageUrl:
      "https://cdn.openai.com/labs/images/A%20red%20apple%20with%20a%20bite%20taken%20out%20of%20it.webp?v=1",
    prompt:
      "A red apple with a bite taken out of it, in the style of a 3D render",
    model: "DALL-E 3",
    likes: 76,
    username: "minimal_art",
    timestamp: "3 days ago",
  },
];

export default function ExploreScreen() {
  const [images, setImages] = useState(SAMPLE_IMAGES);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
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
                item.model === "DALL-E 3" ? "image-filter-hdr" : "image-edit"
              }
              size={14}
              color={Colors[colorScheme ?? "light"].text}
              style={styles.modelBadgeIcon}
            />
            <ThemedText style={styles.modelBadgeText}>{item.model}</ThemedText>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.image, { width: windowWidth - 48 }]}
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
      <ThemedView style={styles.header}>
        <ThemedText type="title">Explore AI Art</ThemedText>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons
            name="tune"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0A7EA4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontWeight: "600",
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
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  modelBadgeIcon: {
    marginRight: 4,
  },
  modelBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  imageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  promptContainer: {
    marginTop: 4,
  },
  prompt: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
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
});
