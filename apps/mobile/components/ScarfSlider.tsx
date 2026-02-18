import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

interface Props {
  domain: string;
  question: string;
  value: number;
  onChange: (v: number) => void;
}

export function ScarfSlider({ domain, question, value, onChange }: Props) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-bold text-navy text-center mb-3">
        {domain.toUpperCase()}
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6 px-4">
        {question}
      </Text>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={1}
        maximumValue={10}
        step={0.1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#E8913A"
        maximumTrackTintColor="#e0ddd8"
        thumbTintColor="#1B2A4A"
      />
      <View className="flex-row justify-between px-2 mt-1">
        <Text className="text-sm text-gray-400">Rarely</Text>
        <Text className="text-lg font-bold text-navy">{value.toFixed(1)}</Text>
        <Text className="text-sm text-gray-400">Deeply</Text>
      </View>
    </View>
  );
}
