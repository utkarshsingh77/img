import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  UserInterest,
  userPreferencesService,
} from "@/services/userPreferencesService";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface InterestSelectorProps {
  onInterestsSelected: (interests: UserInterest[]) => void;
  minSelection?: number;
  maxSelection?: number;
}

export function InterestSelector({
  onInterestsSelected,
  minSelection = 1,
  maxSelection = 5,
}: InterestSelectorProps) {
  const [availableInterests, setAvailableInterests] = useState<UserInterest[]>(
    []
  );
  const [selectedInterests, setSelectedInterests] = useState<UserInterest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Load all available interests and user's current selections
    async function loadInterests() {
      try {
        setLoading(true);

        // Get all available interests
        const allInterests = userPreferencesService.getAvailableInterests();
        setAvailableInterests(allInterests);

        // Get user's current interests
        const userInterests = await userPreferencesService.getUserInterests();
        setSelectedInterests(userInterests);
      } catch (error) {
        console.error("Error loading interests:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInterests();
  }, []);

  // Toggle an interest selection
  const toggleInterest = (interest: UserInterest) => {
    let newSelections: UserInterest[];

    if (selectedInterests.some((i) => i.id === interest.id)) {
      // Remove the interest if it's already selected
      newSelections = selectedInterests.filter((i) => i.id !== interest.id);
    } else {
      // Add the interest if we haven't hit max selection
      if (selectedInterests.length >= maxSelection) {
        return; // Don't add if at max
      }
      newSelections = [...selectedInterests, interest];
    }

    setSelectedInterests(newSelections);
    onInterestsSelected(newSelections);
  };

  // Check if an interest is selected
  const isSelected = (interest: UserInterest) => {
    return selectedInterests.some((i) => i.id === interest.id);
  };

  // Render an interest item
  const renderInterestItem = ({ item }: { item: UserInterest }) => {
    const selected = isSelected(item);
    return (
      <TouchableOpacity
        style={[styles.interestItem, selected && styles.selectedItem]}
        onPress={() => toggleInterest(item)}
      >
        <View style={styles.interestContent}>
          <ThemedText style={styles.interestName}>{item.name}</ThemedText>

          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.selectionIndicator}>
          {selected ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
          ) : (
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading interests...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Select Your Interests</ThemedText>
      <ThemedText style={styles.subtitle}>
        Choose {minSelection}-{maxSelection} topics to personalize your feed
      </ThemedText>

      <FlatList
        data={availableInterests}
        renderItem={renderInterestItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <ThemedView style={styles.selectionInfo}>
        <ThemedText style={styles.selectionText}>
          {selectedInterests.length} of {maxSelection} selected
        </ThemedText>

        {selectedInterests.length < minSelection && (
          <ThemedText style={styles.warningText}>
            Please select at least {minSelection} interest
            {minSelection !== 1 ? "s" : ""}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  interestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedItem: {
    borderColor: Colors.light.tint,
    backgroundColor: "rgba(10, 126, 164, 0.05)",
  },
  interestContent: {
    flex: 1,
  },
  interestName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagBadge: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    fontSize: 12,
    opacity: 0.7,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  selectionInfo: {
    padding: 16,
    alignItems: "center",
  },
  selectionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  warningText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
  },
});
