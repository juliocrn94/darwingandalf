import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Agent } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock } from "lucide-react";

interface AgentTemplate extends Agent {
  metrics?: {
    averageConversion: number;
    averageSatisfaction: string;
    averageResponseTime: number;
    totalConversations: number;
  };
  matchScore?: number;
  matchReason?: string;
  workers_goals?: string;
  integrations?: string;
  qualification_criteria?: string;
  pain?: string;
  is_template?: boolean;
}

interface SelectAgentStepProps {
  discoverySessionId: string;
  onAgentSelect: (agentId: string) => void;
  selectedAgentId: string | null;
}

export const SelectAgentStep = ({
  discoverySessionId,
  onAgentSelect,
  selectedAgentId,
}: SelectAgentStepProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedTemplates();
  }, [discoverySessionId]);

  const fetchRecommendedTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-templates", {
        body: { sessionId: discoverySessionId },
      });

      if (error) throw error;

      setTemplates(data.templates || []);
      
      if (data.templates?.length > 0) {
        toast({
          title: "Templates recomendados",
          description: `Encontramos ${data.templates.length} templates que se ajustan a tu caso de uso`,
        });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los templates recomendados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Seleccionar Template Base</h2>
        <p className="text-muted-foreground">
          Basándonos en tu discovery, estos son los templates recomendados
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 bg-card border-border animate-pulse">
              <div className="h-48 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <p className="text-muted-foreground">
            No se encontraron templates recomendados. Intenta con otro discovery.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`p-6 cursor-pointer transition-all border-2 ${
                selectedAgentId === template.id
                  ? "border-primary shadow-glow bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
              onClick={() => onAgentSelect(template.id)}
            >
              <div className="space-y-4">
                {/* Header with Match Score */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{template.name}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary">{template.industry}</Badge>
                      {template.integrations && (
                        <Badge variant="outline" className="text-xs">
                          {template.integrations}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {template.matchScore ? (
                    <Badge variant="default" className="text-sm shrink-0 ml-2">
                      {Math.round(template.matchScore)}% match
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-sm shrink-0 ml-2">
                      Disponible
                    </Badge>
                  )}
                </div>

                {/* Match Reason */}
                {template.matchReason && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2">
                    {template.matchReason}
                  </p>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>

                {/* Pain Points Box */}
                {template.pain && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                      🎯 Resuelve:
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      {template.pain}
                    </p>
                  </div>
                )}

                {/* Anonymous Metrics */}
                {template.metrics && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <TrendingUp className="w-3 h-3" />
                        Conversión
                      </div>
                      <p className="font-bold text-foreground">
                        {template.metrics.averageConversion}%
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Users className="w-3 h-3" />
                        Satisfacción
                      </div>
                      <p className="font-bold text-foreground">
                        {template.metrics.averageSatisfaction}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        Tiempo
                      </div>
                      <p className="font-bold text-foreground">
                        {template.metrics.averageResponseTime}s
                      </p>
                    </div>
                  </div>
                )}

                {/* Intents Preview */}
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(template.intents) &&
                    template.intents.slice(0, 3).map((intent: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {intent.name || intent.description}
                      </Badge>
                    ))}
                  {Array.isArray(template.intents) && template.intents.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.intents.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
