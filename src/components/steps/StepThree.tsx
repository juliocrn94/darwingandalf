import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "start" | "action" | "end";
}

interface FlowConnection {
  from: string;
  to: string;
}

const initialNodes: FlowNode[] = [
  { id: "1", label: "internal_assistant", x: 200, y: 50, type: "start" },
  { id: "2", label: "membership_flow", x: 100, y: 150, type: "action" },
  { id: "3", label: "transfer", x: 200, y: 150, type: "action" },
  { id: "4", label: "plan_data", x: 300, y: 150, type: "action" },
  { id: "5", label: "close_sales", x: 100, y: 250, type: "action" },
  { id: "6", label: "plan_confirmation", x: 300, y: 250, type: "action" },
  { id: "7", label: "faq", x: 100, y: 350, type: "end" },
];

const initialConnections: FlowConnection[] = [
  { from: "1", to: "2" },
  { from: "1", to: "3" },
  { from: "1", to: "4" },
  { from: "2", to: "5" },
  { from: "4", to: "6" },
  { from: "5", to: "7" },
];

export const StepThree = () => {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [connections] = useState<FlowConnection[]>(initialConnections);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEditNode = (nodeId: string, currentLabel: string) => {
    setEditingNode(nodeId);
    setEditValue(currentLabel);
  };

  const handleSaveEdit = (nodeId: string) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, label: editValue } : node
    ));
    setEditingNode(null);
    setEditValue("");
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "start":
        return "bg-primary/10 border-primary text-primary";
      case "end":
        return "bg-success/10 border-success text-success";
      default:
        return "bg-card border-border text-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">View & Edit Conversation Flow</h2>
        <p className="text-muted-foreground">
          Review and customize the agent's conversation flow structure
        </p>
      </div>

      <Card className="p-8 bg-card border-border min-h-[500px]">
        <div className="relative w-full h-full">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {connections.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 80;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x + 80;
              const y2 = toNode.y + 15;

              return (
                <g key={i}>
                  <defs>
                    <marker
                      id={`arrowhead-${i}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3, 0 6"
                        fill="hsl(var(--primary))"
                        opacity="0.5"
                      />
                    </marker>
                  </defs>
                  <path
                    d={`M ${x1} ${y1} Q ${x1} ${(y1 + y2) / 2} ${x2} ${y2}`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.5"
                    markerEnd={`url(#arrowhead-${i})`}
                  />
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                zIndex: 10,
              }}
            >
              <div
                className={`relative px-4 py-2 rounded-lg border-2 shadow-sm transition-all hover:shadow-md ${getNodeColor(
                  node.type
                )}`}
                style={{ minWidth: "160px" }}
              >
                {editingNode === node.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(node.id);
                        if (e.key === "Escape") setEditingNode(null);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleSaveEdit(node.id)}
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{node.label}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditNode(node.id, node.label)}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {node.type !== "start" && (
                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {node.type === "start" && (
                  <Badge className="absolute -top-2 -right-2 text-xs" variant="default">
                    Start
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Node
        </Button>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-border bg-card"></div>
            <span>Action</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-success bg-success/10"></div>
            <span>End</span>
          </div>
        </div>
      </div>
    </div>
  );
};
