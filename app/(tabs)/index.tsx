import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getRecipePhoto } from "@/app/Food/data/recipe/photos";

import { items } from "@/app/Food/data/items";
import { Recipe, recipes } from "@/app/Food/data/recipe/recipe";

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



/* ---------------- CHECK INGREDIENTS ---------------- */

const isIngredientAvailable = (ingredientName: string) => {
  const name = ingredientName
    .toLowerCase()
    .trim();

  return items.some((item) => {
    if (item.quantity <= 0) {
      return false;
    }

    const itemName = item.name
      .toLowerCase()
      .trim();

    return itemName === name;
  });
};



/* ---------------- CARD ---------------- */


const RecipeCard = ({
  item,
  onPress,
}: {
  item: Recipe;
  onPress: () => void;
}) => {


  const available = item.ingredients.filter((ingredient) =>
    isIngredientAvailable(ingredient.name)
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


        <Text style={styles.title}>
          {item.title}
        </Text>



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
              isIngredientAvailable(
                ingredient.name
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



  return (

    <FlatList

      data={recipes}


      keyExtractor={(item)=>item.id}


      renderItem={({item})=>(

        <RecipeCard

          item={item}

          onPress={()=>
            router.push(
              `/recipe/${item.id}`
            )
          }

        />

      )}


      pagingEnabled


      snapToInterval={height}


      decelerationRate="fast"


      showsVerticalScrollIndicator={false}

    />

  );

}





/* ---------------- STYLES ---------------- */


const styles = StyleSheet.create({


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