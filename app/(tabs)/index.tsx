import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const router = useRouter();

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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.accountSection}>
        <ThemedText type="subtitle">Account Management</ThemedText>
        <ThemedView style={styles.accountOptions}>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => router.push("/profile")}
          >
            <ThemedText type="defaultSemiBold">Profile</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => router.push("/settings")}
          >
            <ThemedText type="defaultSemiBold">Settings</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => console.log("Sign out")}
          >
            <ThemedText type="defaultSemiBold">Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  accountSection: {
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  accountOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  accountButton: {
    backgroundColor: "rgba(121, 181, 201, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
});
