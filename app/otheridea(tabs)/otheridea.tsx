import React from "react";
import {
  FlatList,
  SafeAreaView,
} from "react-native";

import { useRouter } from "expo-router";

import RecipeCard from "../../components/RecipeCard";

import { ricardoRecipes as recipes } from "@/app/Food/data/recipe/recipe_r";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
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