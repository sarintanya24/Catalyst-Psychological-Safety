import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const FREQUENCIES = [
  { key: "gentle", label: "Gentle", desc: "1/week" },
  { key: "steady", label: "Steady", desc: "2-3/week" },
  { key: "immersive", label: "Immersive", desc: "Daily" },
];

const DEPTHS = [
  { key: "essentials", label: "Essentials", desc: "Quick prompts" },
  { key: "informed", label: "Informed", desc: "With context" },
  { key: "deep_dive", label: "Deep Dive", desc: "Full insights" },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api("/api/settings").then(setSettings);
  }, []);

  const updateSetting = async (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ [key]: value }),
    });
  };

  const handlePause = async () => {
    await api("/api/settings/pause", {
      method: "POST",
      body: JSON.stringify({ duration: "1_week" }),
    });
    api("/api/settings").then(setSettings);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-8">Settings</Text>

        {/* Frequency Dial */}
        <Text className="text-sm font-bold text-gray-400 mb-3">NUDGE FREQUENCY</Text>
        <View className="flex-row gap-2 mb-6">
          {FREQUENCIES.map((f) => (
            <Pressable
              key={f.key}
              className={`flex-1 py-3 rounded-xl border-2 ${settings?.dialFrequency === f.key ? "border-amber bg-amber/10" : "border-gray-200 bg-white"}`}
              onPress={() => updateSetting("dialFrequency", f.key)}
            >
              <Text className={`text-center text-sm font-bold ${settings?.dialFrequency === f.key ? "text-amber" : "text-gray-500"}`}>
                {f.label}
              </Text>
              <Text className="text-center text-xs text-gray-400">{f.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* Depth Dial */}
        <Text className="text-sm font-bold text-gray-400 mb-3">INSIGHT DEPTH</Text>
        <View className="flex-row gap-2 mb-6">
          {DEPTHS.map((d) => (
            <Pressable
              key={d.key}
              className={`flex-1 py-3 rounded-xl border-2 ${settings?.dialDepth === d.key ? "border-sage bg-sage/10" : "border-gray-200 bg-white"}`}
              onPress={() => updateSetting("dialDepth", d.key)}
            >
              <Text className={`text-center text-sm font-bold ${settings?.dialDepth === d.key ? "text-sage" : "text-gray-500"}`}>
                {d.label}
              </Text>
              <Text className="text-center text-xs text-gray-400">{d.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* Weekends Off */}
        <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
          <Text className="text-base text-navy">Weekends off</Text>
          <Switch
            value={settings?.weekendsOff ?? true}
            onValueChange={(v) => updateSetting("weekendsOff", v)}
            trackColor={{ true: "#E8913A", false: "#e0ddd8" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Pause Button */}
        <Pressable className="bg-coral/10 border-2 border-coral rounded-xl py-4 mt-8" onPress={handlePause}>
          <Text className="text-center text-coral font-bold">
            {settings?.pausedUntil ? "Resume nudges" : "Pause for 1 week"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
