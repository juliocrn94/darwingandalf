import { useEffect, useState } from "react";
import { AgentCard } from "@/components/AgentCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/types/agent";

interface SelectAgentStepProps {
  onAgentSelect: (agentId: string | null) => void;
  selectedAgentId: string | null;
  handoffId?: string;
}

export const SelectAgentStep = ({ 
  onAgentSelect, 
  selectedAgentId,
  handoffId 
}: SelectAgentStepProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, [handoffId]);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      if (handoffId) {
        // Search similar agents using AI
        const { data, error } = await supabase.functions.invoke("search-agents", {
          body: { handoffId }
        });

        if (error) throw error;
        
        if (data?.agents) {
          setAgents(data.agents);
        }
      } else {
        // Load all agents
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data) {
          setAgents(data.map(agent => ({
            ...agent,
            intents: Array.isArray(agent.intents) 
              ? agent.intents.map((intent: any) => ({
                  name: intent?.name || "",
                  description: intent?.description || ""
                }))
              : []
          })));
        }
      }
    } catch (error) {
      console.error("Error loading agents:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los agentes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Select Base Agent
        </h2>
        <p className="text-muted-foreground">
          Elige un agente base para clonar y adaptar a tu cliente
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar agentes por nombre, industria o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando agentes...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron agentes
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgentId === agent.id}
              onSelect={() => onAgentSelect(agent.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
