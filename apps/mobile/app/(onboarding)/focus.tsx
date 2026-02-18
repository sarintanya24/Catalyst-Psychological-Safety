import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { BehaviorCard } from "../../components/BehaviorCard";
import { api } from "../../lib/api";

const TIER_1_BEHAVIORS = [
  { id: "mb-01", name: "Ask before you state", description: "Ask a genuine question before stating your view.", timeSeconds: "10" },
  { id: "mb-02", name: "Name your fallibility", description: 'Name your own fallibility: "I may be wrong about this."', timeSeconds: "5" },
  { id: "mb-03", name: "Thank the dissenter", description: "Thank someone specifically for raising a concern or disagreeing.", timeSeconds: "10" },
  { id: "mb-04", name: "Respond with curiosity", description: 'Respond to bad news with "Help me understand" not "How did this happen?"', timeSeconds: "5" },
  { id: "mb-05", name: "The 5-second pause", description: "Wait 5-7 seconds after asking a question before speaking again.", timeSeconds: "7" },
];

export default function FocusScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await api("/api/onboarding/focus", {
      method: "POST",
      body: JSON.stringify({ microBehaviorId: selected }),
    });
    router.push("/(onboarding)/channels");
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-sm text-gray-400 mb-2">Pick one to start</Text>
        <Text className="text-xl font-bold text-navy mb-6">
          Which feels most natural to try this week?
        </Text>

        {TIER_1_BEHAVIORS.map((b) => (
          <BehaviorCard
            key={b.id}
            name={b.name}
            description={b.description}
            timeSeconds={b.timeSeconds}
            selected={selected === b.id}
            onPress={() => setSelected(b.id)}
          />
        ))}
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable
          className={`rounded-xl py-4 px-8 ${selected ? "bg-amber" : "bg-gray-300"}`}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text className="text-white font-bold text-center text-lg">Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
