import { View, Text, Pressable } from "react-native";

interface Props {
  question: string;
  context?: string;
  options: string[];
  onRespond: (response: string) => void;
}

export function NudgeCard({ question, context, options, onRespond }: Props) {
  return (
    <View className="bg-white rounded-2xl p-5 mx-4 shadow-sm border border-gray-100">
      <Text className="text-sm text-amber font-bold mb-2">TODAY'S NUDGE</Text>
      <Text className="text-base text-navy leading-6 mb-2">{question}</Text>
      {context && <Text className="text-sm text-gray-400 mb-4">{context}</Text>}
      <View className="flex-row gap-2 mt-2">
        {options.map((opt, i) => (
          <Pressable
            key={i}
            className={`flex-1 py-3 rounded-xl ${i === 0 ? "bg-amber" : "bg-gray-100"}`}
            onPress={() => onRespond(i === 0 ? "tried" : i === 1 ? "skipped" : "later")}
          >
            <Text className={`text-center text-sm font-bold ${i === 0 ? "text-white" : "text-gray-500"}`}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
