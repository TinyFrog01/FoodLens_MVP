import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
const colorScheme = useColorScheme();

return (
<GestureHandlerRootView style={{ flex: 1 }}>
<Tabs
screenOptions={{
tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
headerShown: false,
tabBarButton: HapticTab,
tabBarBackground: TabBarBackground,
tabBarStyle: Platform.select({
ios: {
position: 'absolute',
            },
default: {},
          }),
        }}
>
<Tabs.Screen
name="index"
options={{
title: 'Home',
tabBarIcon: ({ color }) => (
<IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
/>

<Tabs.Screen
name="recettes"
options={{
title: 'Recette',
tabBarIcon: ({ color }) => (
<IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
/>
<Tabs.Screen
name="camera"
options={{
title: 'Camera',
tabBarIcon: ({ color }) => (
<IconSymbol size={28} name="camera.fill" color={color} />
            ),
          }}
/>
<Tabs.Screen
name="aliments"
options={{
title: 'Aliments',
tabBarIcon: ({ color }) => (
<IconSymbol size={28} name="leaf.fill" color={color} />
            ),
          }}
/>

<Tabs.Screen
name="chatbot"
options={{
title: 'chatbot',
tabBarIcon: ({ color }) => (
<IconSymbol size={28} name="camera.fill" color={color} />
            ),
          }}
/>
</Tabs>
</GestureHandlerRootView>
  );
}