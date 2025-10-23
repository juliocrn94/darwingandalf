import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PromptVariant } from "@/types/agent";

interface VoicePromptStepProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onVariantSelect: (variantId: number | null) => void;
}

const AI_MODELS = [
  { id: "gpt-4", name: "GPT-4", icon: "🧠" },
  { id: "claude-3", name: "Claude 3", icon: "🤖" },
  { id: "gemini-pro", name: "Gemini Pro", icon: "✨" },
];

export const VoicePromptStep = ({
  selectedModel,
  onModelChange,
  onVariantSelect,
}: VoicePromptStepProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [variants, setVariants] = useState<PromptVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleRecord = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        setHasRecorded(true);
        setTranscript("Quiero que el agente sea más amigable y use un tono casual. Debe hacer preguntas de seguimiento para entender mejor las necesidades del cliente.");
      }, 3000);
    }
  };

  const handleGenerateVariants = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-prompt", {
        body: {
          audioTranscript: transcript,
          agentData: { model: selectedModel },
          targetModel: selectedModel
        }
      });

      if (error) throw error;

      if (data?.variants) {
        setVariants(data.variants);
        toast({
          title: "Variantes generadas",
          description: `Se generaron ${data.variants.length} variantes de prompt`,
        });
      }
    } catch (error) {
      console.error("Error generating variants:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar las variantes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (variantId: number) => {
    setSelectedVariant(variantId);
    onVariantSelect(variantId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Voice Prompt Optimization
        </h2>
        <p className="text-muted-foreground">
          Optimiza el prompt del agente usando instrucciones de voz
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Modelo de IA Objetivo</h3>
        </div>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.icon} {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex flex-col items-center space-y-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? "bg-red-500 animate-pulse" 
              : hasRecorded 
                ? "bg-green-500" 
                : "bg-primary"
          }`}>
            <Mic className="w-12 h-12 text-white" />
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">
              {isRecording 
                ? "Grabando..." 
                : hasRecorded 
                  ? "Grabación completa" 
                  : "Da instrucciones de voz"
              }
            </h3>
            <p className="text-muted-foreground text-sm">
              {isRecording 
                ? "Habla ahora para describir cómo debe comportarse el agente" 
                : hasRecorded 
                  ? "Listo para generar variantes" 
                  : "Haz clic para comenzar a grabar"
              }
            </p>
          </div>

          <Button
            onClick={handleRecord}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="gap-2"
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" /> Detener
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> {hasRecorded ? "Grabar de nuevo" : "Grabar"}
              </>
            )}
          </Button>

          {hasRecorded && !isRecording && (
            <Button
              onClick={handleGenerateVariants}
              disabled={isGenerating}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generando..." : "Generar Variantes"}
            </Button>
          )}
        </div>
      </Card>

      {hasRecorded && transcript && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Transcripción</h3>
          <p className="text-muted-foreground">{transcript}</p>
        </Card>
      )}

      {variants.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            Variantes de Prompt Optimizadas
          </h3>
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {variants.map((variant, index) => (
                <TabsTrigger key={variant.id} value={index.toString()}>
                  {variant.style}
                </TabsTrigger>
              ))}
            </TabsList>

            {variants.map((variant, index) => (
              <TabsContent key={variant.id} value={index.toString()} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Score: {variant.score}/100
                  </Badge>
                  <Button
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    onClick={() => handleSelectVariant(variant.id)}
                  >
                    {selectedVariant === variant.id ? "Seleccionado" : "Seleccionar"}
                  </Button>
                </div>
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{variant.text}</p>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}
    </div>
  );
};
