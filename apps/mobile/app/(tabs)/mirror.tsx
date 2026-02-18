import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ScarfRadar } from "../../components/ScarfRadar";

export default function MirrorScreen() {
  const [mirror, setMirror] = useState<any>(null);

  useEffect(() => {
    api("/api/mirror/latest").then((data) => setMirror(data.mirrorMoment || null));
  }, []);

  if (!mirror) {
    return (
      <SafeAreaView className="flex-1 bg-cream justify-center items-center">
        <Text className="text-lg text-gray-400">Your Mirror Moment</Text>
        <Text className="text-sm text-gray-300 mt-2 px-8 text-center">
          After your team completes their first pulse survey, you'll see how your self-assessment compares to their experience.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 pt-8">
        <Text className="text-2xl font-bold text-navy text-center mb-6">Mirror Moment</Text>

        <ScarfRadar
          selfScores={mirror.selfAssessment || {}}
          teamScores={mirror.teamPerception?.domainScores || {}}
        />

        {mirror.gaps?.length > 0 && (
          <View className="px-6 mt-8">
            <Text className="text-sm font-bold text-gray-400 mb-3">BIGGEST GAPS</Text>
            {mirror.gaps.slice(0, 3).map((gap: any, i: number) => (
              <View key={i} className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
                <Text className="text-sm font-bold text-navy capitalize">{gap.domain}</Text>
                <Text className="text-xs text-gray-400">
                  You: {gap.selfScore?.toFixed(1)} → Team: {gap.teamScore?.toFixed(1)} (Δ {gap.delta?.toFixed(1)})
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
