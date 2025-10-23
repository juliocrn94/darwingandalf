import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AI_MODELS = [
  { id: "gpt-4", name: "GPT-4 (OpenAI)", icon: "🤖" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo (OpenAI)", icon: "⚡" },
  { id: "claude-3.5", name: "Claude 3.5 Sonnet (Anthropic)", icon: "🧠" },
  { id: "gemini-pro", name: "Gemini Pro (Google)", icon: "💎" },
  { id: "llama-3", name: "Llama 3 (Meta)", icon: "🦙" },
];

const mockVariants = [
  {
    style: "concise",
    score: 0.91,
    text: "You are a professional AI assistant for AgroFinance Corp. Help users explore loan options, answer product questions, and schedule consultations. Stay concise and action-oriented.",
  },
  {
    style: "balanced",
    score: 0.89,
    text: "You are a professional AI assistant representing AgroFinance Corp, a leading agricultural financing company. Your role is to help farmers and agribusinesses explore loan options, understand our products, answer questions, and schedule consultations with our experts. Maintain a professional yet empathetic tone, focusing on building trust and providing clear, actionable information.",
  },
  {
    style: "detailed",
    score: 0.87,
    text: "You are a professional and empathetic AI assistant representing AgroFinance Corp, a company with over 15 years of experience in agricultural financing. Your primary objectives are to: (1) help users explore customized loan solutions, (2) provide detailed information about our flexible payment terms and competitive rates, (3) answer questions about our products and services, (4) capture lead information when appropriate, and (5) schedule consultations with our financing experts. Always maintain a consultative approach, demonstrating understanding of agricultural challenges while highlighting how our solutions can empower growth. Be transparent, never promise what cannot be delivered, and escalate complex cases to human experts.",
  },
];

interface StepFiveProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onVariantSelect: (variant: number | null) => void;
}

export const StepFive = ({ selectedModel, onModelChange, onVariantSelect }: StepFiveProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const handleRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 3000);
  };

  const handleSelectVariant = (index: number) => {
    setSelectedVariant(index);
    onVariantSelect(index);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Voice to Prompt Optimization</h2>
        <p className="text-muted-foreground">
          Select target AI model and record instructions to optimize the agent's prompts
        </p>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Target AI Model</label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <span className="flex items-center gap-2">
                    <span>{model.icon}</span>
                    <span>{model.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Audio will be optimized for this model's prompting characteristics
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center justify-center py-12 flex-col gap-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-smooth ${
              isRecording
                ? "bg-destructive/20 animate-pulse shadow-glow"
                : "bg-primary/20"
            }`}
          >
            <Mic className={`w-12 h-12 ${isRecording ? "text-destructive" : "text-primary"}`} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isRecording ? "Recording..." : hasRecorded ? "Recording Complete" : "Ready to Record"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Describe the agent's mission, tone, or specific instructions you want to include
            </p>
          </div>
          <div className="flex gap-3">
            {!hasRecorded ? (
              <Button
                variant={isRecording ? "destructive" : "gradient"}
                size="lg"
                onClick={handleRecord}
                disabled={isRecording}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button variant="outline" size="lg" onClick={() => setHasRecorded(false)}>
                  <Mic className="w-5 h-5 mr-2" />
                  Record Again
                </Button>
                <Button variant="gradient" size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Variants
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {hasRecorded && (
        <>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Transcript</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              "The agent should be professional and empathetic, helping farmers understand our loan
              products. Focus on building trust and capturing leads for our consultation service. Use
              simple language and always offer to schedule a call with our experts."
            </p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Optimized Prompt Variants</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Optimized for {AI_MODELS.find(m => m.id === selectedModel)?.icon} {AI_MODELS.find(m => m.id === selectedModel)?.name}
              </Badge>
            </div>
            <Tabs defaultValue="balanced" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="concise">Concise</TabsTrigger>
                <TabsTrigger value="balanced">Balanced</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
              </TabsList>
              {mockVariants.map((variant, index) => (
                <TabsContent key={variant.style} value={variant.style} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-success/20 text-success border-success/50">
                        Score: {(variant.score * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="secondary">{variant.style}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-secondary/30 rounded-lg">
                    {variant.text}
                  </p>
                  <Button
                    variant={selectedVariant === index ? "default" : "outline"}
                    onClick={() => handleSelectVariant(index)}
                  >
                    {selectedVariant === index ? "Selected" : "Select This Variant"}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
};
