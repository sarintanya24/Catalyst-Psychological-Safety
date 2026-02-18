import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { api } from "../../lib/api";
import { useStore } from "../../lib/store";
import { SafetyRing } from "../../components/SafetyRing";
import { NudgeCard } from "../../components/NudgeCard";

const STAGE_NAMES: Record<string, string> = {
  "1": "Foundation", "2": "Building", "3": "Expanding", "4": "Leading",
};

export default function HomeScreen() {
  const { dashboard, setDashboard } = useStore();

  useEffect(() => {
    api("/api/dashboard").then(setDashboard);
  }, []);

  const handleNudgeRespond = async (response: string) => {
    if (!dashboard?.todayNudge?.id) return;
    await api(`/api/nudges/${dashboard.todayNudge.id}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    });
    api("/api/dashboard").then(setDashboard);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-navy">
            Hey{dashboard?.user?.name ? `, ${dashboard.user.name.split(" ")[0]}` : ""}
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            {dashboard?.streakCount ? `${dashboard.streakCount} day streak` : "Let's get started"}
          </Text>
        </View>

        <SafetyRing
          score={dashboard?.safetyScore ?? null}
          stage={STAGE_NAMES[dashboard?.user?.currentStage || "1"] || "Foundation"}
        />

        {dashboard?.todayNudge && (
          <NudgeCard
            question={dashboard.todayNudge.content?.question || ""}
            context={dashboard.todayNudge.content?.context}
            options={dashboard.todayNudge.content?.options || ["Tried it", "Skip", "Later"]}
            onRespond={handleNudgeRespond}
          />
        )}

        <View className="px-6 py-6">
          <Text className="text-sm font-bold text-gray-400 mb-3">THIS WEEK</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-navy">{dashboard?.weeklyEngagement?.responded ?? 0}</Text>
              <Text className="text-xs text-gray-400">Engaged</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-navy">{dashboard?.streakCount ?? 0}</Text>
              <Text className="text-xs text-gray-400">Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-navy">{dashboard?.user?.currentStage ?? "1"}</Text>
              <Text className="text-xs text-gray-400">Stage</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
