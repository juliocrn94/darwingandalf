import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Copy } from "lucide-react";

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

export const StepTwo = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Similar Handoffs Found</h2>
        <p className="text-muted-foreground">
          Select an agent to use as a base for cloning
        </p>
      </div>

      <div className="grid gap-4">
        {mockMatches.map((match, index) => (
          <Card
            key={match.agent_id}
            className="p-6 bg-card border-border hover:shadow-card hover:border-primary/50 transition-smooth cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{match.client_name}</h3>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
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

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
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

            <div className="flex gap-3">
              <Button variant="gradient" className="flex-1" onClick={onNext}>
                <Copy className="w-4 h-4 mr-2" />
                Clone This Agent
              </Button>
              <Button variant="outline">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
