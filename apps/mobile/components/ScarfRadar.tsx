import { View, Text } from "react-native";

interface Props {
  selfScores: Record<string, number>;
  teamScores: Record<string, number>;
}

const DOMAINS = ["status", "certainty", "autonomy", "relatedness", "fairness"];

export function ScarfRadar({ selfScores, teamScores }: Props) {
  return (
    <View className="px-4">
      {DOMAINS.map((d) => (
        <View key={d} className="mb-4">
          <Text className="text-sm font-bold text-navy capitalize mb-1">{d}</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-sage w-8">You</Text>
            <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-sage rounded-full"
                style={{ width: `${(selfScores[d] || 5) * 10}%` }}
              />
            </View>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-coral w-8">Team</Text>
            <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-coral rounded-full"
                style={{ width: `${(teamScores[d] || 5) * 10}%` }}
              />
            </View>
          </View>
        </View>
      ))}
      <View className="flex-row justify-center gap-6 mt-4">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-sage" />
          <Text className="text-xs text-gray-500">Self-assessment</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-coral" />
          <Text className="text-xs text-gray-500">Team perception</Text>
        </View>
      </View>
    </View>
  );
}
