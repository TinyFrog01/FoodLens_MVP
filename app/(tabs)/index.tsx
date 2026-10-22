import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getRecipePhoto } from "@/app/Food/data/recipe/photos";

import { isIngredientOnHand } from "@/app/Food/data/utils/ingredients";
import AvatarButton from "@/components/account/AvatarButton";
import { CookingForPill, CookingForSheet } from "@/components/account/CookingFor";
import { applianceLabel } from "@/constants/dietary";
import { useAccount } from "@/context/AccountContext";
import { useAlwaysOnHand } from "@/hooks/useAlwaysOnHand";
import { useRecipeFeed } from "@/hooks/useRecipeFeed";
import { RecipeVerdict, displayDiets } from "@/lib/account/recipeFilter";

const { height, width } = Dimensions.get("window");


/* ---------------- BADGE ---------------- */

const getBadge = (missing: number) => {
  if (missing <= 0) {
    return {
      text: "Tous",
      color: "#18A64B",
    };
  }

  if (missing === 1) {
    return {
      text: "1",
      color: "#F5C542",
    };
  }

  if (missing === 2) {
    return {
      text: "2",
      color: "#F59E0B",
    };
  }
  if (missing === 3) {
    return {
      text: "3",
      color: "#F97316",
    };
  }

  if (missing === 4) {
    return {
      text: "4",
      color: "#EA580C",
    };
  }

  return {
    text: "+5",
    color: "#E53935",
  };
};



/* ---------------- CARD ---------------- */


/* Pastilles personnelles : ce que quelqu'un n'aime pas, l'appareil qui
   manque, ce que quelqu'un aime (2 au maximum). */
const getFlags = (verdict: RecipeVerdict) => {
  const flags: {
    key: string;
    text: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }[] = [];

  verdict.dislikes.forEach(({ person, term }) =>
    flags.push({
      key: `dislike-${person}-${term}`,
      text: `${person} n'aime pas : ${term}`,
      icon: "thumbs-down-outline",
      color: "rgba(217,119,6,0.92)",
    })
  );

  if (verdict.missingAppliances.length > 0) {
    flags.push({
      key: "appliance",
      text: `Nécessite : ${verdict.missingAppliances.map(applianceLabel).join(", ")}`,
      icon: "alert-circle-outline",
      color: "rgba(0,0,0,0.6)",
    });
  }

  verdict.likes.forEach(({ person, term }) =>
    flags.push({
      key: `like-${person}-${term}`,
      text: `${person} aime : ${term}`,
      icon: "heart",
      color: "rgba(24,166,75,0.92)",
    })
  );

  return flags.slice(0, 2);
};



const RecipeCard = ({
  verdict,
  onPress,
}: {
  verdict: RecipeVerdict;
  onPress: () => void;
}) => {

  const item = verdict.recipe;
  const flags = getFlags(verdict);
  const diets = displayDiets(item).slice(0, 3);
  const { activeStaples } = useAlwaysOnHand();


  const available = item.ingredients.filter((ingredient) =>
    isIngredientOnHand(ingredient.name, activeStaples)
  );


  const missing =
    item.ingredients.length -
    available.length;


  const badge = getBadge(missing);



  return (

    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.card}
      onPress={onPress}
    >


      {/* IMAGE */}

     

<Image
  source={getRecipePhoto(item.id)}
  style={styles.image}
/>



      {/* DARK OVERLAY */}

      <View style={styles.overlay}/>



      {/* CONTENT */}

      <View style={styles.content}>


        {/* PERSONAL FLAGS */}

        {flags.length > 0 && (
          <View style={styles.flags}>
            {flags.map((flag) => (
              <View
                key={flag.key}
                style={[styles.flag, { backgroundColor: flag.color }]}
              >
                <Ionicons name={flag.icon} size={13} color="#fff" />
                <Text style={styles.flagText}>{flag.text}</Text>
              </View>
            ))}
          </View>
        )}


        <Text style={styles.title}>
          {item.title}
        </Text>



        {/* DIET TAGS */}

        {diets.length > 0 && (
          <View style={styles.diets}>
            {diets.map((diet) => (
              <View key={diet} style={styles.dietChip}>
                <Text style={styles.dietText}>{diet}</Text>
              </View>
            ))}
          </View>
        )}



        <View style={styles.row}>


          <Ionicons
            name="time-outline"
            size={18}
            color="white"
          />


          <Text style={styles.text}>
            {item.time}
          </Text>



          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  badge.color,
              },
            ]}
          >

            <Text style={styles.badgeText}>
              {badge.text}
            </Text>

          </View>




          <MaterialCommunityIcons
            name="leaf"
            size={18}
            color={
              item.vegan
                ? "#4CAF50"
                : "#999"
            }
            style={{
              marginLeft:10,
            }}
          />

        </View>




        {/* INGREDIENT CHIPS */}


        <View style={styles.ingredients}>


          {item.ingredients
            .slice(0,4)
            .map((ingredient) => {


            const available =
              isIngredientOnHand(
                ingredient.name,
                activeStaples
              );



            return (

              <View
                key={ingredient.name}
                style={[
                  styles.ingChip,
                  {
                    backgroundColor:
                    available
                    ? "#18A64B"
                    : "#E53935",
                  },
                ]}
              >

                <Text style={styles.ingText}>
                  {ingredient.name} 
                </Text>


              </View>

            );

          })}


        </View>



        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
        >

          <Text style={styles.buttonText}>
            Voir la recette
          </Text>

        </TouchableOpacity>



      </View>


    </TouchableOpacity>

  );
};





/* ---------------- FEED ---------------- */


export default function RecipeFeed(){


  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account } = useAccount();

  // Recettes filtrées pour les personnes choisies (tout, en mode invité)
  const { visible } = useRecipeFeed();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isEmpty = visible.length === 0;



  return (

    <View style={styles.page}>

      {isEmpty ? (

        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="food-off-outline"
            size={64}
            color="#BFBFBF"
          />
          <Text style={styles.emptyTitle}>
            Aucune recette ne convient
          </Text>
          <Text style={styles.emptyText}>
            Les régimes, allergies, appareils ou le temps maximum des
            personnes choisies masquent toutes les recettes.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setSheetOpen(true)}
          >
            <Text style={styles.emptyButtonText}>
              Changer pour qui je cuisine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.emptyLink}>Modifier mes préférences</Text>
          </TouchableOpacity>
        </View>

      ) : (

        <FlatList

          data={visible}


          keyExtractor={(item)=>item.recipe.id}


          renderItem={({item})=>(

            <RecipeCard

              verdict={item}

              onPress={()=>
                router.push(
                  `/recipe/${item.recipe.id}`
                )
              }

            />

          )}


          pagingEnabled


          snapToInterval={height}


          decelerationRate="fast"


          showsVerticalScrollIndicator={false}

        />

      )}



      {/* TOP BAR : pour qui je cuisine + compte */}

      <View
        style={[styles.topBar, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <CookingForPill onPress={() => setSheetOpen(true)} />
        <AvatarButton onDark={!isEmpty} />
      </View>


      {account && (
        <CookingForSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}

    </View>

  );

}





/* ---------------- STYLES ---------------- */


const styles = StyleSheet.create({


  page:{
    flex:1,
    backgroundColor:"#F7F6F3",
  },



  topBar:{
    position:"absolute",
    left:16,
    right:16,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
  },



  flags:{
    flexDirection:"row",
    flexWrap:"wrap",
    marginBottom:10,
  },



  flag:{
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:20,
    marginRight:8,
    marginBottom:6,
  },



  flagText:{
    color:"#fff",
    fontSize:12,
    fontWeight:"800",
    marginLeft:5,
  },



  diets:{
    flexDirection:"row",
    flexWrap:"wrap",
    marginTop:10,
  },



  dietChip:{
    backgroundColor:"rgba(255,255,255,0.2)",
    borderWidth:1,
    borderColor:"rgba(255,255,255,0.45)",
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:20,
    marginRight:6,
    marginBottom:4,
  },



  dietText:{
    color:"#fff",
    fontSize:12,
    fontWeight:"700",
  },



  empty:{
    flex:1,
    alignItems:"center",
    justifyContent:"center",
    paddingHorizontal:32,
  },



  emptyTitle:{
    fontSize:24,
    fontWeight:"800",
    color:"#1C1C1A",
    marginTop:18,
    textAlign:"center",
  },



  emptyText:{
    fontSize:15,
    color:"#8E8E86",
    marginTop:8,
    textAlign:"center",
    lineHeight:21,
  },



  emptyButton:{
    marginTop:24,
    backgroundColor:"#111",
    paddingVertical:14,
    paddingHorizontal:26,
    borderRadius:30,
  },



  emptyButtonText:{
    color:"#fff",
    fontSize:16,
    fontWeight:"700",
  },



  emptyLink:{
    marginTop:16,
    color:"#3E9C5C",
    fontSize:15,
    fontWeight:"700",
  },



  card:{
    width,
    height,
  },



  image:{
    width,
    height,
    position:"absolute",
  },



  overlay:{
    position:"absolute",
    width,
    height,
    backgroundColor:
      "rgba(0,0,0,0.4)",
  },



  content:{
    position:"absolute",
    bottom:90,
    padding:20,
    width,
  },



  title:{
    fontSize:38,
    fontWeight:"900",
    color:"#fff",
  },



  row:{
    flexDirection:"row",
    alignItems:"center",
    marginTop:12,
  },



  text:{
    color:"#fff",
    marginLeft:6,
    marginRight:12,
    fontSize:16,
  },



  badge:{
    paddingHorizontal:14,
    paddingVertical:5,
    borderRadius:20,
  },



  badgeText:{
    color:"#fff",
    fontWeight:"800",
  },



  ingredients:{
    flexDirection:"row",
    flexWrap:"wrap",
    marginTop:15,
  },



  ingChip:{
    paddingHorizontal:12,
    paddingVertical:7,
    borderRadius:20,
    marginRight:8,
    marginBottom:8,
  },



  ingText:{
    color:"#fff",
    fontSize:12,
    fontWeight:"700",
  },



  button:{
    marginTop:20,
    backgroundColor:"#fff",
    paddingVertical:14,
    borderRadius:30,
    alignItems:"center",
  },



  buttonText:{
    fontSize:16,
    fontWeight:"900",
  },


});