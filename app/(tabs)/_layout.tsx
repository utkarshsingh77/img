import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import {
  ExploreIcon,
  HomeIcon,
  ImageGeneratorIcon,
  TextGeneratorIcon,
} from "@/components/ui/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors[colorScheme ?? "light"].tabIconDefault,
          height: 50 + bottom,
        },
        tabBarShowLabel: false,
      }}
      tabBar={(props) => (
        <BottomTabBar
          {...props}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderTopColor: Colors[colorScheme ?? "light"].tabIconDefault,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 50 + bottom,
          }}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarItemStyle: {
            borderTopColor: "transparent",
            borderTopWidth: 2,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="aiimage"
        options={{
          title: "AI Image",
          headerShown: true,
          headerTitle: "AI Image Generator",
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: Colors[colorScheme ?? "light"].tabIconDefault,
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTitleStyle: {
            color: Colors[colorScheme ?? "light"].text,
            fontSize: 18,
            fontWeight: "600",
          },
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15, padding: 5 }}
              onPress={() => console.log("Settings pressed - aiimage")}
            >
              <MaterialCommunityIcons
                name="cog"
                size={24}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
          ),
          tabBarItemStyle: {
            borderTopColor: "transparent",
            borderTopWidth: 2,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused }) => <ImageGeneratorIcon focused={focused} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="aitext"
        options={{
          title: "AI Text",
          headerShown: true,
          headerTitle: "AI Text Generator",
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: Colors[colorScheme ?? "light"].tabIconDefault,
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTitleStyle: {
            color: Colors[colorScheme ?? "light"].text,
            fontSize: 18,
            fontWeight: "600",
          },
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15, padding: 5 }}
              onPress={() => console.log("Settings pressed - aitext")}
            >
              <MaterialCommunityIcons
                name="cog"
                size={24}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
          ),
          tabBarItemStyle: {
            borderTopColor: "transparent",
            borderTopWidth: 2,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused }) => <TextGeneratorIcon focused={focused} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarItemStyle: {
            borderTopColor: "transparent",
            borderTopWidth: 2,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused }) => <ExploreIcon focused={focused} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
    </Tabs>
  );
}
