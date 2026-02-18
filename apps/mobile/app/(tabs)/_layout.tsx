import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E8913A",
        tabBarInactiveTintColor: "#8a8580",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#e0ddd8",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>●</Text> }}
      />
      <Tabs.Screen
        name="mirror"
        options={{ title: "Mirror", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>◑</Text> }}
      />
      <Tabs.Screen
        name="cascade"
        options={{ title: "Cascade", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>◤</Text> }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: "Library", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☰</Text> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙</Text> }}
      />
    </Tabs>
  );
}
