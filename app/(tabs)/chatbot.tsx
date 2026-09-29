import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#222" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color="#222" />
        </TouchableOpacity>

        <View style={styles.avatar} />
      </View>

      {/* Greeting */}
      <View style={styles.content}>
        

        <Text style={styles.description}>
          Bonjour ___ Vous pouvez créer des recettes. Prendre une photo pour demander des
          éléments spécifiques ou simplement demander une recette avec des
          contraintes spéciales.
        </Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={28} color="#000" />
          <TextInput
            placeholder="Demander une recette..."
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* Suggestions */}
        <View style={styles.chipsContainer}>
          <View style={styles.chip} />
          <View style={styles.chipSmall} />
          <View style={styles.chipLarge} />
          <View style={styles.chipSmall} />
        </View>
      </View>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 15,
  },

  iconButton: {
    marginHorizontal: 8,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7ED67A",
    marginLeft: 10,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },



  description: {
    fontSize: 40,
    lineHeight: 37,
    color: "#111",
    marginBottom: 50,
  },

  searchBar: {
    height: 62,
    backgroundColor: "#FFF",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },

  chip: {
    width: 62,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFF",
    marginRight: 10,
    marginBottom: 12,
  },

  chipSmall: {
    width: 36,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFF",
    marginRight: 10,
    marginBottom: 12,
  },

  chipLarge: {
    width: 92,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFF",
    marginRight: 10,
    marginBottom: 12,
  },
});