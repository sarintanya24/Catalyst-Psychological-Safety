import { View, Text, Pressable } from "react-native";

interface Props {
  name: string;
  description: string;
  timeSeconds: string;
  selected: boolean;
  onPress: () => void;
}

export function BehaviorCard({ name, description, timeSeconds, selected, onPress }: Props) {
  return (
    <Pressable
      className={`border-2 rounded-xl p-4 mb-3 ${selected ? "border-amber bg-amber/5" : "border-gray-200 bg-white"}`}
      onPress={onPress}
    >
      <Text className="text-base font-bold text-navy">{name}</Text>
      <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      <Text className="text-xs text-gray-400 mt-2">~{timeSeconds} sec</Text>
    </Pressable>
  );
}
