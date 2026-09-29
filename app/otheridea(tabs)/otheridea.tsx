import React from "react";
import {
  FlatList,
  SafeAreaView,
} from "react-native";

import { useRouter } from "expo-router";

import RecipeCard from "../../components/RecipeCard";

import { recipes } from "@/app/Food/data/recipe/recipe";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              router.push(`/recipe/${item.id}`)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}