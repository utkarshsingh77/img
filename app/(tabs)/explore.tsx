import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ImageGenerator } from "@/components/ImageGenerator";
import { InterestSelector } from "@/components/InterestSelector";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  feedGenerationService,
  FeedItem,
} from "@/services/feedGenerationService";
import {
  UserInterest,
  userPreferencesService,
} from "@/services/userPreferencesService";

// Updated sample data with interest field
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
    interest: "animals",
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
    interest: "architecture",
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
    interest: "abstract",
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
    interest: "animals",
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
    interest: "nature",
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
    interest: "nature",
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
    interest: "space",
  },
];

export default function ExploreScreen() {
  const [images, setImages] = useState<FeedItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
  const [showGenerator, setShowGenerator] = useState(false);
  const [showInterestSelector, setShowInterestSelector] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<UserInterest[]>(
    []
  );
  const [activeInterestFilter, setActiveInterestFilter] = useState<
    string | null
  >(null);
  const [firstLoad, setFirstLoad] = useState(true);

  const colorScheme = useColorScheme();
  const { top, bottom } = useSafeAreaInsets();

  // Load images and check if we need to show the interest selector
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);

        // Check if user has interests
        const userInterests = await userPreferencesService.getUserInterests();
        setSelectedInterests(userInterests);

        // Show interest selector if this is first launch and no interests are set
        const shouldShowInterestSelector =
          firstLoad && userInterests.length === 0;
        setShowInterestSelector(shouldShowInterestSelector);

        if (!shouldShowInterestSelector) {
          // Load feed content
          await loadFeedContent();
        }

        setFirstLoad(false);
      } catch (error) {
        console.error("Error initializing explore screen:", error);
        // Fallback to sample data
        setImages(SAMPLE_IMAGES as FeedItem[]);
        setFilteredImages(SAMPLE_IMAGES as FeedItem[]);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [firstLoad]);

  // Apply filter when active interest changes or images change
  useEffect(() => {
    if (activeInterestFilter) {
      const filtered = images.filter(
        (item) => item.interest === activeInterestFilter
      );
      setFilteredImages(filtered.length > 0 ? filtered : images);
    } else {
      setFilteredImages(images);
    }
  }, [activeInterestFilter, images]);

  // Load feed content from service
  const loadFeedContent = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Generate feed content
      const generatedItems = await feedGenerationService.generateFeedContent(
        forceRefresh
      );

      if (generatedItems.length > 0) {
        setImages(generatedItems);
        setFilteredImages(
          activeInterestFilter
            ? generatedItems.filter(
                (item) => item.interest === activeInterestFilter
              )
            : generatedItems
        );
      } else {
        // Fallback to sample data if nothing was generated
        setImages(SAMPLE_IMAGES as FeedItem[]);
        setFilteredImages(SAMPLE_IMAGES as FeedItem[]);
      }
    } catch (error) {
      console.error("Error loading feed content:", error);
      setImages(SAMPLE_IMAGES as FeedItem[]);
      setFilteredImages(SAMPLE_IMAGES as FeedItem[]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeedContent(true); // Force refresh
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
    const newImages = [...images, ...moreImages.slice(0, 3)];
    setImages(newImages);
    setFilteredImages(
      activeInterestFilter
        ? newImages.filter((item) => item.interest === activeInterestFilter)
        : newImages
    );
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
    const newImage: FeedItem = {
      id: `gen-${Date.now()}`,
      imageUrl,
      prompt,
      model: "Flux Schnell",
      likes: 0,
      username: "you", // In a real app, this would be the user's username
      timestamp: "Just now",
      // No interest assigned for user-generated images
    };

    const newImages = [newImage, ...images];
    setImages(newImages);
    setFilteredImages(
      activeInterestFilter
        ? newImages.filter((item) => item.interest === activeInterestFilter)
        : newImages
    );
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

  // Handle saving interests
  const handleInterestsSelected = async (interests: UserInterest[]) => {
    if (interests.length >= 1) {
      setSelectedInterests(interests);
      await userPreferencesService.updateInterests(interests);
      setShowInterestSelector(false);
      setActiveInterestFilter(null);

      // Generate feed content based on new interests
      await loadFeedContent(true);
    }
  };

  // Handle interest filter click
  const handleInterestFilterClick = (interestId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveInterestFilter(
      activeInterestFilter === interestId ? null : interestId
    );
  };

  // Get interest name from ID
  const getInterestName = (interestId: string | undefined): string => {
    if (!interestId) return "Recommended";
    const interest = selectedInterests.find((i) => i.id === interestId);
    return interest ? interest.name : "Recommended";
  };

  const renderInterestFilterBar = () => {
    if (selectedInterests.length === 0) return null;

    return (
      <View style={styles.interestFilterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.interestFilterBar}
        >
          <TouchableOpacity
            style={[
              styles.interestFilterItem,
              activeInterestFilter === null && styles.activeInterestFilter,
            ]}
            onPress={() => handleInterestFilterClick(null)}
          >
            <ThemedText
              style={[
                styles.interestFilterText,
                activeInterestFilter === null &&
                  styles.activeInterestFilterText,
              ]}
            >
              All
            </ThemedText>
          </TouchableOpacity>

          {selectedInterests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestFilterItem,
                activeInterestFilter === interest.id &&
                  styles.activeInterestFilter,
              ]}
              onPress={() => handleInterestFilterClick(interest.id)}
            >
              <ThemedText
                style={[
                  styles.interestFilterText,
                  activeInterestFilter === interest.id &&
                    styles.activeInterestFilterText,
                ]}
              >
                {interest.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderImageCard = ({ item }: { item: FeedItem }) => {
    const isLiked = liked[item.id] || false;
    const interestName = getInterestName(item.interest);

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
          {item.interest && (
            <TouchableOpacity
              style={styles.interestTag}
              onPress={() =>
                item.interest && handleInterestFilterClick(item.interest)
              }
            >
              <MaterialCommunityIcons
                name="tag"
                size={14}
                color="#fff"
                style={styles.interestTagIcon}
              />
              <ThemedText style={styles.interestTagText}>
                {interestName}
              </ThemedText>
            </TouchableOpacity>
          )}
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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.interestsButton}
            onPress={() => setShowInterestSelector(true)}
          >
            <MaterialCommunityIcons
              name="tag-multiple"
              size={22}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowGenerator(true)}
          >
            <View style={styles.createButtonContent}>
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <ThemedText style={styles.createButtonText}>Create</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {renderInterestFilterBar()}

      {loading && images.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
          <ThemedText style={styles.loadingText}>
            Generating personalized feed...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredImages}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="image-filter-hdr"
                size={48}
                color={Colors[colorScheme ?? "light"].text}
                style={{ opacity: 0.5 }}
              />
              <ThemedText style={styles.emptyText}>
                {activeInterestFilter
                  ? "No images for this interest yet. Try another filter or pull to refresh."
                  : "No images found. Pull to refresh."}
              </ThemedText>
            </View>
          }
          ListFooterComponent={
            loading && filteredImages.length > 0 ? (
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
      )}

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

      {/* Interest Selector Modal */}
      <Modal
        visible={showInterestSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          // Only allow closing if not first load or if interests are selected
          if (!firstLoad || selectedInterests.length > 0) {
            setShowInterestSelector(false);
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
            <View style={styles.interestSelectorHeader}>
              <ThemedText type="title">Your Interests</ThemedText>

              {/* Only show close button if not first load or if interests already selected */}
              {(!firstLoad || selectedInterests.length > 0) && (
                <TouchableOpacity
                  onPress={() => setShowInterestSelector(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </TouchableOpacity>
              )}
            </View>

            <InterestSelector
              onInterestsSelected={handleInterestsSelected}
              minSelection={1}
              maxSelection={5}
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
                selectedInterests.length === 0 && styles.disabledButton,
              ]}
              onPress={() => handleInterestsSelected(selectedInterests)}
              disabled={selectedInterests.length === 0}
            >
              <ThemedText style={styles.saveButtonText}>
                Save & Generate Feed
              </ThemedText>
            </TouchableOpacity>
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  interestsButton: {
    padding: 8,
    marginRight: 8,
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
  interestFilterBarContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  interestFilterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  interestFilterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  activeInterestFilter: {
    backgroundColor: Colors.light.tint,
  },
  interestFilterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeInterestFilterText: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.7,
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
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },
  interestTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  interestTagIcon: {
    marginRight: 4,
  },
  interestTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
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
  interestSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
