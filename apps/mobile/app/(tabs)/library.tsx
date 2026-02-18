import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BehaviorCard } from "../../components/BehaviorCard";

const ALL_BEHAVIORS = [
  { id: "mb-01", name: "Ask before you state", description: "Ask a genuine question before stating your view.", timeSeconds: "10", tier: 1 },
  { id: "mb-02", name: "Name your fallibility", description: 'Name your own fallibility: "I may be wrong about this."', timeSeconds: "5", tier: 1 },
  { id: "mb-03", name: "Thank the dissenter", description: "Thank someone specifically for raising a concern or disagreeing.", timeSeconds: "10", tier: 1 },
  { id: "mb-04", name: "Respond with curiosity", description: 'Respond to bad news with "Help me understand" not "How did this happen?"', timeSeconds: "5", tier: 1 },
  { id: "mb-05", name: "The 5-second pause", description: "Wait 5-7 seconds after asking a question before speaking again.", timeSeconds: "7", tier: 1 },
  { id: "mb-06", name: '"What are we missing?"', description: 'Ask "What are we missing?" before making a final decision.', timeSeconds: "15", tier: 2 },
  { id: "mb-07", name: "Share a personal mistake", description: "Share a personal mistake or learning moment with your team.", timeSeconds: "30", tier: 2 },
  { id: "mb-08", name: "Check in on the person", description: "Check in on the person, not the project.", timeSeconds: "30", tier: 2 },
  { id: "mb-09", name: "Credit someone else's idea", description: "Credit someone else's idea publicly in a meeting or message.", timeSeconds: "10", tier: 2 },
  { id: "mb-10", name: "Separate brainstorm from evaluation", description: "Explicitly separate brainstorming from evaluation.", timeSeconds: "15", tier: 2 },
];

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-6">Behavior Library</Text>

        <Text className="text-sm font-bold text-amber mb-3">TIER 1 — START HERE</Text>
        {ALL_BEHAVIORS.filter((b) => b.tier === 1).map((b) => (
          <BehaviorCard key={b.id} name={b.name} description={b.description} timeSeconds={b.timeSeconds} selected={false} onPress={() => {}} />
        ))}

        <Text className="text-sm font-bold text-sage mb-3 mt-6">TIER 2 — LEVEL UP</Text>
        {ALL_BEHAVIORS.filter((b) => b.tier === 2).map((b) => (
          <BehaviorCard key={b.id} name={b.name} description={b.description} timeSeconds={b.timeSeconds} selected={false} onPress={() => {}} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
