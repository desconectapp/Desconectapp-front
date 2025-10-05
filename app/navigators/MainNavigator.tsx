// MainNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  PreferencesScreen,
  ProfileScreen,
  HomeScreen,
  SearchScreen,
  ActivityRequestsScreen,
  GroupScreen,
  LocationPickerScreen,
  SchedulePickerScreen,
  ActivityPickerScreen,
  RequestConfirmationScreen,
  CommunitiesScreen,
  CreateGroupScreen,
} from "@/screens"
import AntDesign from "@expo/vector-icons/AntDesign"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import Ionicons from "@expo/vector-icons/Ionicons"
import { TouchableOpacity } from "react-native"
import { View } from "tamagui"
import { Animated, Pressable } from "react-native"
import { useRef } from "react"
import { MyGroupsScreen } from "@/screens/MyGroupsScreen"
import { SuggestionScreen } from "@/screens/SuggestionScreen"
import { GroupInfoScreen } from "@/screens/GroupInfoScreen"
import { NearbyGroupsScreen } from "@/screens/NearbyGroupsScreen"

export type MainTabParamList = {
  HomeScreen: undefined
  CommunitiesScreen: undefined
  SearchScreen: undefined
  ActivityRequestsScreen: undefined
  ProfileScreen: undefined
}

export type MainStackParamList = {
  Tabs: { screen?: keyof MainTabParamList } | undefined
  PreferencesScreen: undefined
  GroupScreen: { groupId: string }
  SuggestionScreen: { id: string }
  LocationPickerScreen: { nextScreen?: string }
  SchedulePickerScreen: { nextScreen?: string }
  ActivityPickerScreen: { nextScreen?: string }
  RequestConfirmationScreen: { nextScreen?: string }
  MyGroupsScreen: undefined
  GroupInfoScreen: { groupId: string }
  NearbyGroupsScreen: undefined
  CreateGroupScreen: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()
const Stack = createNativeStackNavigator<MainStackParamList>()

const CustomTabBarButton = ({ onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: 5,
        alignSelf: "center",
        width: 72,
        height: 72,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          width: "100%",
          height: "100%",
          borderRadius: 24,
          backgroundColor: "rgba(200, 220, 180, 0.25)", // más claro
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
          filter: "blur(15px)" as any,
          shadowColor: "#84994F",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 15,
          elevation: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* reflejito arriba */}
        <View
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            height: "35%",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            backgroundColor: "rgba(255,255,255,0.3)", // más brillo
          }}
        />
        <FontAwesome6 name="people-group" size={38} color="#fff" />
      </Animated.View>
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
          tabBarIcon: ({ color, size }) => <AntDesign name="team" size={size} color={color} />,
          tabBarLabel: "Groups",
        }}
      />
      <Tab.Screen
        name="CommunitiesScreen"
        component={CommunitiesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="earth" size={size} color={color} />,
          tabBarLabel: "Communities",
        }}
      />
      <Tab.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="find" size={28} color="#fff" />,
          tabBarLabel: "",
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="ActivityRequestsScreen"
        component={ActivityRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          tabBarLabel: "Búsquedas",
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
      <Stack.Screen
        name="SuggestionScreen"
        component={SuggestionScreen}
        options={{
          animation: "fade",
          headerShown: false,
        }}
      />
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PreferencesScreen" component={PreferencesScreen} />
      <Stack.Screen name="GroupScreen" component={GroupScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="LocationPickerScreen"
        component={LocationPickerScreen}
        options={{ headerShown: true, title: "Ubicación 📍" }}
      />
      <Stack.Screen
        name="SchedulePickerScreen"
        component={SchedulePickerScreen}
        options={{ headerShown: true, title: "Horarios" }}
      />
      <Stack.Screen
        name="ActivityPickerScreen"
        component={ActivityPickerScreen}
        options={{ headerShown: true, title: "Actividad" }}
      />
      <Stack.Screen
        name="RequestConfirmationScreen"
        component={RequestConfirmationScreen}
        options={{ headerShown: true, title: "Confirmar Busqueda" }}
      />
      <Stack.Screen
        name="MyGroupsScreen"
        component={MyGroupsScreen}
        options={{ title: "My Groups" }}
      />
      <Stack.Screen
        name="GroupInfoScreen"
        component={GroupInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateGroupScreen"
        component={CreateGroupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="NearbyGroupsScreen" component={NearbyGroupsScreen} options={{ title: "Nearby Groups" }} />
      {/* <Stack.Screen name="SearchScreen" component={SearchScreen} /> */}
    </Stack.Navigator>
  )
}

