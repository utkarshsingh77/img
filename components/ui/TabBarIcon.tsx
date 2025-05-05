import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TabBarIconProps {
  focused: boolean;
}

export function HomeIcon({ focused }: TabBarIconProps) {
  const colorScheme = useColorScheme();
  const color = focused
    ? Colors[colorScheme ?? "light"].tint
    : Colors[colorScheme ?? "light"].tabIconDefault;

  return (
    <MaterialCommunityIcons
      name="home"
      size={24}
      color={color}
      style={styles.icon}
    />
  );
}

export function ImageGeneratorIcon({ focused }: TabBarIconProps) {
  const colorScheme = useColorScheme();
  const color = focused
    ? Colors[colorScheme ?? "light"].tint
    : Colors[colorScheme ?? "light"].tabIconDefault;

  return (
    <MaterialCommunityIcons
      name="image-plus"
      size={24}
      color={color}
      style={styles.icon}
    />
  );
}

export function TextGeneratorIcon({ focused }: TabBarIconProps) {
  const colorScheme = useColorScheme();
  const color = focused
    ? Colors[colorScheme ?? "light"].tint
    : Colors[colorScheme ?? "light"].tabIconDefault;

  return (
    <MaterialCommunityIcons
      name="text-box-plus"
      size={24}
      color={color}
      style={styles.icon}
    />
  );
}

export function ExploreIcon({ focused }: TabBarIconProps) {
  const colorScheme = useColorScheme();
  const color = focused
    ? Colors[colorScheme ?? "light"].tint
    : Colors[colorScheme ?? "light"].tabIconDefault;

  return (
    <MaterialCommunityIcons
      name="compass"
      size={24}
      color={color}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    marginBottom: -3,
  },
});
