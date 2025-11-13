import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, fontSize, fontWeight } from "../config/theme";
import { MainTabParamList } from "./types";

// New Screens
import NewHomeScreen from "../screens/NewHomeScreen";
import SavedRecipesScreen from "../screens/SavedRecipesScreen";
import SummaryScreen from "../screens/SummaryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Saved":
              iconName = focused ? "bookmark" : "bookmark-outline";
              break;
            case "Summary":
              iconName = focused ? "stats-chart" : "stats-chart-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#888888",
        tabBarStyle: {
          backgroundColor: 'rgba(247, 245, 242, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(224, 224, 224, 0.5)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
          position: 'absolute',
          backdropFilter: 'blur(10px)',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: fontWeight.semibold,
        },
        headerShown: false,
      })}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}>
      <Tab.Screen
        name="Home"
        component={NewHomeScreen}
        options={{
          title: "Home",
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedRecipesScreen}
        options={{
          title: "Saved",
        }}
      />
      <Tab.Screen
        name="Summary"
        component={SummaryScreen}
        options={{
          title: "Summary",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
