import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Feature card types
interface Feature {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
  color: string;
}

// Recent item types
interface RecentItem {
  id: string;
  type: "text" | "image";
  title: string;
  date: string;
}

// Feature card data
const features: Feature[] = [
  {
    id: "aitext",
    title: "AI Text Generator",
    icon: "text-box-outline",
    description: "Create tweets, jokes, facts, and custom content",
    color: "#0a7ea4",
  },
  {
    id: "aiimage",
    title: "AI Image Generator",
    icon: "image-outline",
    description: "Generate stunning AI images from text prompts",
    color: "#8e44ad",
  },
  {
    id: "explore",
    title: "Explore",
    icon: "compass-outline",
    description: "Discover community creations and trending content",
    color: "#27ae60",
  },
];

// Recent items data (would typically come from state/api)
const recentItems: RecentItem[] = [
  {
    id: "1",
    type: "text",
    title: "Tweet about technology",
    date: "2 hours ago",
  },
  {
    id: "2",
    type: "image",
    title: "Space nebula with stars",
    date: "Yesterday",
  },
  {
    id: "3",
    type: "text",
    title: "Joke about programming",
    date: "2 days ago",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { top } = useSafeAreaInsets();

  const navigateToFeature = useCallback(
    (screenId: string) => {
      if (
        screenId === "aitext" ||
        screenId === "aiimage" ||
        screenId === "explore"
      ) {
        router.push(`/${screenId}`);
      }
    },
    [router]
  );

  const navigateToSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const navigateToProfile = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const renderFeatureCard = useCallback(
    ({ item }: { item: Feature }) => (
      <Pressable
        style={[styles.featureCard, { backgroundColor: `${item.color}15` }]}
        onPress={() => navigateToFeature(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon} size={28} color="white" />
        </View>
        <ThemedText style={styles.featureTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.featureDescription}>
          {item.description}
        </ThemedText>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={Colors[colorScheme ?? "light"].text}
          style={styles.featureArrow}
        />
      </Pressable>
    ),
    [navigateToFeature, colorScheme]
  );

  const renderRecentItem = useCallback(
    ({ item }: { item: RecentItem }) => (
      <Pressable
        style={styles.recentItem}
        onPress={() =>
          navigateToFeature(item.type === "text" ? "aitext" : "aiimage")
        }
      >
        <View
          style={[
            styles.recentIconContainer,
            {
              backgroundColor: item.type === "text" ? "#0a7ea415" : "#8e44ad15",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={item.type === "text" ? "text-box-outline" : "image-outline"}
            size={20}
            color={item.type === "text" ? "#0a7ea4" : "#8e44ad"}
          />
        </View>
        <View style={styles.recentItemContent}>
          <ThemedText style={styles.recentItemTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.recentItemDate}>{item.date}</ThemedText>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={Colors[colorScheme ?? "light"].tabIconDefault}
        />
      </Pressable>
    ),
    [navigateToFeature, colorScheme]
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <ThemedText type="title" style={styles.greeting}>
              Welcome
            </ThemedText>
            <HelloWave />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={navigateToSettings}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.profileButton]}
              onPress={navigateToProfile}
            >
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ThemedText style={styles.subtitle}>
          Create amazing content with AI
        </ThemedText>
      </View>

      {/* Main Features */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>AI Tools</ThemedText>
        <FlatList
          data={features}
          renderItem={renderFeatureCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featureList}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={280}
        />
      </ThemedView>

      {/* Recent Items */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
          <TouchableOpacity onPress={() => router.push("/explore")}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedView style={styles.recentList}>
          {recentItems.map((item) => (
            <React.Fragment key={item.id}>
              {renderRecentItem({ item })}
            </React.Fragment>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Quick Tips Card */}
      <ThemedView style={styles.tipCard}>
        <View style={styles.tipIconContainer}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={24}
            color="#f39c12"
          />
        </View>
        <View style={styles.tipContent}>
          <ThemedText style={styles.tipTitle}>Pro Tip</ThemedText>
          <ThemedText style={styles.tipText}>
            Try mixing different prompts in the AI Text generator for more
            creative results!
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    backgroundColor: "rgba(10, 126, 164, 0.1)",
  },
  section: {
    padding: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  featureList: {
    paddingRight: 20,
    gap: 16,
  },
  featureCard: {
    width: 260,
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  featureArrow: {
    position: "absolute",
    right: 16,
    bottom: 16,
    opacity: 0.5,
  },
  viewAllText: {
    color: "#0a7ea4",
    fontWeight: "500",
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontWeight: "500",
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  tipCard: {
    flexDirection: "row",
    margin: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(243, 156, 18, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(243, 156, 18, 0.2)",
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(243, 156, 18, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
