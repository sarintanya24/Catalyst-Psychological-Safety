import { View, Text, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { api } from "../../lib/api";

const CHANNEL_OPTIONS = [
  { key: "slack", label: "Slack", description: "Quick nudges in DM" },
  { key: "teams", label: "Microsoft Teams", description: "Nudges via Teams chat" },
  { key: "zoom_post", label: "Zoom (Post-Meeting)", description: "Insights after meetings" },
  { key: "zoom_meeting", label: "Zoom (In-Meeting)", description: "Live sidebar coaching" },
  { key: "email", label: "Email", description: "Weekly digest" },
  { key: "push", label: "Mobile Push", description: "Calendar-timed nudges" },
];

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Record<string, boolean>>({
    slack: false, teams: false, zoom_post: false, zoom_meeting: false, email: true, push: false,
  });

  const handleComplete = async () => {
    await api("/api/onboarding/channels", {
      method: "POST",
      body: JSON.stringify({ channels }),
    });
    await api("/api/onboarding/complete", { method: "POST" });
    router.replace("/(tabs)");
  };

  const anySelected = Object.values(channels).some(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-xl font-bold text-navy mb-2">
          Where should we reach you?
        </Text>
        <Text className="text-base text-gray-500 mb-8">
          Toggle on the channels you use. You can change this anytime.
        </Text>

        {CHANNEL_OPTIONS.map((ch) => (
          <View key={ch.key} className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View>
              <Text className="text-base font-bold text-navy">{ch.label}</Text>
              <Text className="text-sm text-gray-400">{ch.description}</Text>
            </View>
            <Switch
              value={channels[ch.key]}
              onValueChange={(v) => setChannels({ ...channels, [ch.key]: v })}
              trackColor={{ true: "#E8913A", false: "#e0ddd8" }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </View>

      <View className="px-6 pb-8">
        <Pressable
          className={`rounded-xl py-4 px-8 ${anySelected ? "bg-amber" : "bg-gray-300"}`}
          onPress={handleComplete}
          disabled={!anySelected}
        >
          <Text className="text-white font-bold text-center text-lg">
            Start my journey
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
