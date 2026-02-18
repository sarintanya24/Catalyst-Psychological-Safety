import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { CascadeTree } from "../../components/CascadeTree";

export default function CascadeScreen() {
  const [tree, setTree] = useState<any>(null);

  useEffect(() => {
    api("/api/cascade").then((data) => {
      if (data.leader) {
        setTree({
          name: data.leader.name || "You",
          safetyScore: data.leader.safetyScore ?? null,
          stage: data.leader.currentStage || 1,
          teamSize: data.directReports?.length || 0,
          children: (data.directReports || []).map((r: any) => ({
            name: r.name,
            safetyScore: null,
            stage: 1,
            teamSize: 0,
            children: [],
          })),
        });
      }
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 pt-8">
        <Text className="text-2xl font-bold text-navy text-center mb-2">Cascade</Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Safety ripples through your organization
        </Text>
        {tree ? (
          <CascadeTree tree={tree} />
        ) : (
          <View className="items-center px-8 mt-12">
            <Text className="text-gray-400 text-center">
              Invite your direct reports to see how safety cascades through your team.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
