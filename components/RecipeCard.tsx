import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Recipe } from "@/app/Food/data/recipe/recipe";

type Props = {
  recipe: Recipe;
  onPress: () => void;
};

export default function RecipeCard({
  recipe,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
    >
      <Image
        source={{ uri: recipe.image }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          {recipe.title}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={18}
              color="#777"
            />
            <Text style={styles.infoText}>
              {recipe.time}
            </Text>
          </View>

          <Text style={styles.dot}>•</Text>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="fridge-outline"
              size={18}
              color="#777"
            />

            <Text style={styles.infoText}>
              {recipe.ingredientsAvailable}
            </Text>
          </View>

          <Text style={styles.dot}>•</Text>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="leaf"
              size={18}
              color="#4CAF50"
            />

            <Text style={styles.vegan}>
              {recipe.vegan ? "Vegan" : "Non-Vegan"}
            </Text>
          </View>
        </View>

        <View style={styles.tags}>
          {recipe.ingredients.map((ingredient) => (
            <View
              key={ingredient.name}
              style={styles.tag}
            >
              <Text style={styles.tagText}>
                {ingredient.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    overflow: "hidden",
    
  },

  image: {
    width: "100%",
    height: 200,
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    marginLeft: 5,
    color: "#666",
  },

  vegan: {
    marginLeft: 6,
    color: "#4CAF50",
    fontWeight: "600",
  },

  dot: {
    marginHorizontal: 10,
    color: "#999",
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tag: {
    backgroundColor: "#EAF7E5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },

  tagText: {
    color: "#3F7D3B",
    fontWeight: "600",
  },
});