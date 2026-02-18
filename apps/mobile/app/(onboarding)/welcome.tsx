import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PerceptionGap } from "../../components/PerceptionGap";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-navy text-center mb-2">
          Catalyst
        </Text>
        <Text className="text-lg text-gray-500 text-center mb-12">
          How safe does your team feel to speak up?
        </Text>

        <PerceptionGap />

        <Text className="text-base text-gray-500 text-center mt-8 px-4 leading-6">
          The gap between how leaders and teams experience safety is the #1 blind spot in leadership.
        </Text>

        <Pressable
          className="bg-amber rounded-xl py-4 px-8 mt-12 mx-6"
          onPress={() => router.push("/(onboarding)/scarf")}
        >
          <Text className="text-white font-bold text-center text-lg">
            Close the gap
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
