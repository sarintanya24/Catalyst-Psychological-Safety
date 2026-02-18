import { View, Text, useWindowDimensions } from "react-native";
import { useEffect } from "react";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

export function PerceptionGap() {
  const { width: screenWidth } = useWindowDimensions();
  const barWidth = screenWidth - 48 - 48; // px-6 padding on each side = 48px total, minus some margin

  const execProgress = useSharedValue(0);
  const teamProgress = useSharedValue(0);

  useEffect(() => {
    execProgress.value = withTiming(0.93, { duration: 1500 });
    teamProgress.value = withTiming(0.53, { duration: 1500 });
  }, []);

  const execStyle = useAnimatedStyle(() => ({
    width: execProgress.value * barWidth,
  }));

  const teamStyle = useAnimatedStyle(() => ({
    width: teamProgress.value * barWidth,
  }));

  return (
    <View className="px-6 py-4">
      <View className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">YOU</Text>
        <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View style={[execStyle, { height: "100%", borderRadius: 9999, backgroundColor: "#4A9E7D", justifyContent: "center", alignItems: "flex-end", paddingRight: 12 }]}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>93%</Text>
          </Animated.View>
        </View>
      </View>
      <View>
        <Text className="text-sm text-gray-500 mb-1">YOUR TEAM</Text>
        <View className="h-8 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View style={[teamStyle, { height: "100%", borderRadius: 9999, backgroundColor: "#E07A6B", justifyContent: "center", alignItems: "flex-end", paddingRight: 12 }]}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>53%</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
