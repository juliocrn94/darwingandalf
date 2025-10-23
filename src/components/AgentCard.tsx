import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2 } from "lucide-react";
import type { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const AgentCard = ({ agent, isSelected, onSelect }: AgentCardProps) => {
  return (
    <Card 
      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{agent.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {agent.industry}
            </Badge>
          </div>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-6 h-6 text-primary" />
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {agent.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4 text-muted-foreground">
          <span>{agent.intents?.length || 0} intents</span>
          <span>{agent.examples_count} ejemplos</span>
          <span>{agent.slots_count} slots</span>
        </div>
        {onSelect && (
          <Button variant="ghost" size="sm">
            {isSelected ? "Seleccionado" : "Seleccionar"}
          </Button>
        )}
      </div>
    </Card>
  );
};
