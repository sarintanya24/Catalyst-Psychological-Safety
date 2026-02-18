import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { ScarfSlider } from "../../components/ScarfSlider";
import { api } from "../../lib/api";

const DOMAINS = [
  { key: "status", label: "Status", question: "How important is it to you to feel respected and valued for your expertise?" },
  { key: "certainty", label: "Certainty", question: "How much do you need predictability and clarity to feel comfortable?" },
  { key: "autonomy", label: "Autonomy", question: "How important is having control over your decisions and work?" },
  { key: "relatedness", label: "Relatedness", question: "How connected do you feel to your team on a personal level?" },
  { key: "fairness", label: "Fairness", question: "How sensitive are you to perceived inequity or inconsistency?" },
];

export default function ScarfScreen() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    status: 5, certainty: 5, autonomy: 5, relatedness: 5, fairness: 5,
  });

  const domain = DOMAINS[step];

  const handleNext = async () => {
    if (step < DOMAINS.length - 1) {
      setStep(step + 1);
    } else {
      await api("/api/onboarding/scarf", {
        method: "POST",
        body: JSON.stringify(scores),
      });
      router.push("/(onboarding)/focus");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="text-sm text-gray-400 text-center mb-2">
          Assessment {step + 1} of {DOMAINS.length}
        </Text>

        <ScarfSlider
          domain={domain.label}
          question={domain.question}
          value={scores[domain.key]}
          onChange={(v) => setScores({ ...scores, [domain.key]: v })}
        />

        <Pressable
          className="bg-navy rounded-xl py-4 px-8 mx-6 mt-8"
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-center text-lg">
            {step < DOMAINS.length - 1 ? "Next" : "See my profile"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
