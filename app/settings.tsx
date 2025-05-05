import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Switch, TouchableOpacity } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Preferences</ThemedText>

        <ThemedView style={styles.settingRow}>
          <ThemedText>Push Notifications</ThemedText>
          <Switch value={notifications} onValueChange={setNotifications} />
        </ThemedView>

        <ThemedView style={styles.settingRow}>
          <ThemedText>Dark Mode</ThemedText>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </ThemedView>

        <ThemedView style={styles.settingRow}>
          <ThemedText>Save Search History</ThemedText>
          <Switch value={saveHistory} onValueChange={setSaveHistory} />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Account</ThemedText>

        <TouchableOpacity style={styles.textButton}>
          <ThemedText>Change Password</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.textButton}>
          <ThemedText>Privacy Settings</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.textButton}>
          <ThemedText style={styles.dangerText}>Delete Account</ThemedText>
        </TouchableOpacity>
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
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  textButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  dangerText: {
    color: "#E53935",
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
