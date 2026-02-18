import { View, Text } from "react-native";

interface CascadeNode {
  name: string;
  safetyScore: number | null;
  stage: number;
  teamSize: number;
  children: CascadeNode[];
}

interface Props {
  tree: CascadeNode;
}

function getScoreColor(score: number | null): string {
  if (!score) return "bg-gray-300";
  if (score >= 5.5) return "bg-sage";
  if (score >= 4.0) return "bg-amber";
  return "bg-coral";
}

function NodeCard({ node, depth }: { node: CascadeNode; depth: number }) {
  return (
    <View style={{ marginLeft: depth * 24 }} className="mb-2">
      <View className="flex-row items-center gap-2 bg-white rounded-xl p-3 border border-gray-100">
        <View className={`w-3 h-3 rounded-full ${getScoreColor(node.safetyScore)}`} />
        <View className="flex-1">
          <Text className="text-sm font-bold text-navy">{node.name}</Text>
          <Text className="text-xs text-gray-400">
            {node.safetyScore ? `${node.safetyScore.toFixed(1)}/7` : "No data"} · {node.teamSize} reports
          </Text>
        </View>
      </View>
      {node.children.map((child, i) => (
        <NodeCard key={i} node={child} depth={depth + 1} />
      ))}
    </View>
  );
}

export function CascadeTree({ tree }: Props) {
  return (
    <View className="px-4">
      <NodeCard node={tree} depth={0} />
    </View>
  );
}
