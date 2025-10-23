import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Download, Rocket, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinalReviewStepProps {
  baseAgentId?: string;
  selectedPromptVariant?: number;
  clientUrl?: string;
}

export const FinalReviewStep = ({ 
  baseAgentId,
  selectedPromptVariant,
  clientUrl 
}: FinalReviewStepProps) => {
  const [generatedAgent, setGeneratedAgent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (baseAgentId) {
      generateFinalAgent();
    }
  }, [baseAgentId]);

  const generateFinalAgent = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-agent", {
        body: {
          baseAgentId,
          adaptations: {},
          selectedPrompt: selectedPromptVariant,
          clientUrl
        }
      });

      if (error) throw error;

      if (data?.agent) {
        setGeneratedAgent(data.agent);
      }
    } catch (error) {
      console.error("Error generating agent:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el agente final",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (generatedAgent) {
      const dataStr = JSON.stringify(generatedAgent, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agent-${generatedAgent.id}.json`;
      link.click();
      
      toast({
        title: "Exportado",
        description: "Configuración del agente exportada exitosamente",
      });
    }
  };

  const handleDeploy = () => {
    toast({
      title: "Desplegando",
      description: "El agente se está desplegando...",
    });
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generando configuración final del agente...</p>
        </div>
      </div>
    );
  }

  if (!generatedAgent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay datos de agente disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            ¡Agente Generado Exitosamente!
          </h2>
          <p className="text-muted-foreground">
            Revisa la configuración final y despliega tu agente
          </p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {generatedAgent.name || "Nuevo Agente"}
            </h3>
            <Badge variant="default">
              {generatedAgent.status || "active"}
            </Badge>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">
          {generatedAgent.summary || "Agente conversacional listo para desplegar"}
        </p>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>ID: {generatedAgent.id}</span>
          <span>•</span>
          <span>{generatedAgent.configuration?.intents?.length || 0} intents</span>
        </div>
      </Card>

      <Tabs defaultValue="mission" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mission">Misión</TabsTrigger>
          <TabsTrigger value="context">Contexto</TabsTrigger>
          <TabsTrigger value="intents">Intents</TabsTrigger>
        </TabsList>

        <TabsContent value="mission" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Misión del Agente</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {generatedAgent.configuration?.mission || "N/A"}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Contexto</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {generatedAgent.configuration?.context || "N/A"}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">
              Intenciones ({generatedAgent.configuration?.intents?.length || 0})
            </h3>
            <div className="space-y-3">
              {generatedAgent.configuration?.intents?.map((intent: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 border border-border rounded-lg"
                >
                  <h4 className="font-medium text-foreground">{intent.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {intent.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button variant="outline" size="lg" className="flex-1" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar JSON
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          <Play className="w-4 h-4 mr-2" />
          Probar Agente
        </Button>
        <Button size="lg" className="flex-1" onClick={handleDeploy}>
          <Rocket className="w-4 h-4 mr-2" />
          Desplegar
        </Button>
      </div>
    </div>
  );
};
