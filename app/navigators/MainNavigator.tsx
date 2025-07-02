// MainNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { PreferencesScreen, ProfileScreen, HomeScreen, SearchScreen } from "@/screens"
import AntDesign from "@expo/vector-icons/AntDesign"
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from "react-native";
import { View } from "tamagui";
import { Animated, Pressable } from "react-native"
import { useRef } from "react"


export type MainTabParamList = {
  HomeScreen: undefined
  SearchScreen: undefined
  ProfileScreen: undefined
}

export type MainStackParamList = {
  Tabs: undefined
  PreferencesScreen: undefined
  SearchScreen: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()
const Stack = createNativeStackNavigator<MainStackParamList>()


const CustomTabBarButton = ({ children, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()
  }

 return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: 5, // lo eleva del borde inferior
        alignSelf: "center",
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#4c8bf5",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
      }}
    >
      <AntDesign name="find" size={42} color="#fff" />
    </Pressable>
  )
}


function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
    name="SearchScreen"
    component={SearchScreen}
    options={{
      tabBarIcon: ({ color, size }) => (
        <AntDesign name="find" size={28} color="#fff" />
      ),
      tabBarLabel: "",
      tabBarButton: (props) => <CustomTabBarButton {...props} />,
    }}
  />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="user" size={size} color={color} />,
          tabBarLabel: "Profile",
          tabBarStyle: { display: "flex" }, // Asegura que el tab bar esté visible
        }}
      />
     
    </Tab.Navigator>
  )
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PreferencesScreen" component={PreferencesScreen} />
      {/* <Stack.Screen name="SearchScreen" component={SearchScreen} /> */}
    </Stack.Navigator>
  )
}
