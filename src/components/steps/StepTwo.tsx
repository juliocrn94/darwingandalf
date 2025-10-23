import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mockMatches = [
  {
    handoff_id: "HO-2024-089",
    agent_id: "AG-AGRO-001",
    similarity_score: 0.87,
    shared_tags: ["Agro", "Lead Generation", "Consultative"],
    kpi_summary: "CSAT: 4.5/5 • 1,200+ conversations • 35% conversion rate",
    reason: "Similar because both aim to capture leads in agro-finance using web chat and consultative tone",
    client_name: "AgriBank Solutions",
  },
  {
    handoff_id: "HO-2024-067",
    agent_id: "AG-FIN-002",
    similarity_score: 0.82,
    shared_tags: ["Finance", "Lead Generation", "Professional Tone"],
    kpi_summary: "CSAT: 4.3/5 • 890+ conversations • 28% conversion rate",
    reason: "Matches financial services context with emphasis on professional communication and lead qualification",
    client_name: "FinTech Lending Pro",
  },
  {
    handoff_id: "HO-2024-045",
    agent_id: "AG-AGRO-003",
    similarity_score: 0.79,
    shared_tags: ["Agro", "Web Chat", "Consultative"],
    kpi_summary: "CSAT: 4.6/5 • 650+ conversations • 31% conversion rate",
    reason: "Similar agricultural domain with focus on educational content and consultation scheduling",
    client_name: "FarmTech Innovations",
  },
];

interface StepTwoProps {
  onAgentSelect: (agentId: string) => void;
  selectedAgentId: string | null;
}

export const StepTwo = ({ onAgentSelect, selectedAgentId }: StepTwoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Agentes con Mayor Similitud
        </h2>
        <p className="text-muted-foreground">
          Selecciona un agente para usar como base para la clonación
        </p>
      </div>

      <div className="grid gap-4">
        {mockMatches.map((match) => {
          const isSelected = selectedAgentId === match.agent_id;

          return (
            <Card
              key={match.agent_id}
              onClick={() => onAgentSelect(match.agent_id)}
              className={cn(
                "p-6 relative cursor-pointer transition-all duration-300",
                isSelected
                  ? "border-2 border-primary bg-primary/5 shadow-glow"
                  : "border-2 border-border bg-card hover:border-primary/30 hover:shadow-card"
              )}
            >
              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}

              <div className="flex items-start justify-between mb-4 pr-12">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {match.client_name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-primary/20 text-primary border-primary/50"
                    >
                      {(match.similarity_score * 100).toFixed(0)}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{match.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {match.shared_tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {(match.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>CSAT: 4.5/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>1.2K+ convos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>35% conversion</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
