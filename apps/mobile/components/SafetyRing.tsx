import { View, Text } from "react-native";

interface Props {
  score: number | null;
  stage: string;
}

export function SafetyRing({ score, stage }: Props) {
  const percentage = score ? (score / 7) * 100 : 0;
  return (
    <View className="items-center py-6">
      <View className="w-36 h-36 rounded-full border-8 border-gray-200 items-center justify-center">
        <View
          className="absolute w-36 h-36 rounded-full border-8 border-sage"
          style={{ borderColor: "#4A9E7D", opacity: percentage / 100 }}
        />
        <Text className="text-3xl font-bold text-navy">
          {score ? score.toFixed(1) : "\u2014"}
        </Text>
        <Text className="text-xs text-gray-400">out of 7</Text>
      </View>
      <Text className="text-sm text-sage mt-2 font-bold">{stage}</Text>
    </View>
  );
}
