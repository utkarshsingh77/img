import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Personal Information</ThemedText>
        <ThemedView style={styles.infoRow}>
          <ThemedText>Name:</ThemedText>
          <ThemedText type="defaultSemiBold">John Doe</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText>Email:</ThemedText>
          <ThemedText type="defaultSemiBold">john.doe@example.com</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText>Member since:</ThemedText>
          <ThemedText type="defaultSemiBold">January 2023</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Account Statistics</ThemedText>
        <ThemedView style={styles.infoRow}>
          <ThemedText>Images Generated:</ThemedText>
          <ThemedText type="defaultSemiBold">27</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText>Saved Items:</ThemedText>
          <ThemedText type="defaultSemiBold">12</ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <ThemedText type="defaultSemiBold">Back to Home</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 40,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  button: {
    backgroundColor: "rgba(121, 181, 201, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});
