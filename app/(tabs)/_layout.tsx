import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { CameraTabButton } from "@/components/CameraTabButton";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Palette } from "@/constants/theme";

// Quatre onglets autour d'une seule action principale : la caméra, au centre.
export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Palette.ink,
          tabBarInactiveTintColor: Palette.muted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Ce soir",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recettes"
          options={{
            title: "Tes photos",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "images" : "images-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: "Scanner",
            tabBarButton: CameraTabButton,
          }}
        />
        <Tabs.Screen
          name="aliments"
          options={{
            title: "Ton frigo",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "fridge" : "fridge-outline"}
                size={25}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chatbot"
          options={{
            title: "Assistant",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
