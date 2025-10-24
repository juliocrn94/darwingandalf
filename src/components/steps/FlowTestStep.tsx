import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Edit, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  currentNode?: string;
}

interface FlowNode {
  id: string;
  label: string;
  type: "intent" | "response" | "handoff";
}

interface FlowTestStepProps {
  agentId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export const FlowTestStep = ({ agentId, onComplete, onBack }: FlowTestStepProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentNode, setCurrentNode] = useState<string>("start");
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadAgentFlow();
  }, [agentId]);

  const loadAgentFlow = async () => {
    try {
      const { data: agent } = await supabase
        .from("agents")
        .select("intents, mission")
        .eq("id", agentId)
        .single();

      if (agent) {
        // Construir nodos del flujo basados en los intents
        const intentsArray = Array.isArray(agent.intents) ? agent.intents : [];
        const nodes: FlowNode[] = [
          { id: "start", label: "Inicio", type: "intent" },
          ...intentsArray.map((intent: any, idx: number) => ({
            id: `intent_${idx}`,
            label: intent.name || intent.description,
            type: "intent" as const,
          })),
          { id: "end", label: "Finalización", type: "handoff" },
        ];
        setFlowNodes(nodes);

        // Mensaje inicial del agente
        const initialMessage: Message = {
          role: "assistant",
          content: agent.mission || "¡Hola! ¿En qué puedo ayudarte?",
          currentNode: "start",
        };
        setMessages([initialMessage]);
      }
    } catch (error) {
      console.error("Error loading agent flow:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el flujo del agente",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      content: inputText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const { data, error } = await supabase.functions.invoke("test-agent", {
        body: {
          agentId,
          message: inputText,
          conversationHistory: messages,
          currentNode,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        currentNode: data.node,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentNode(data.node);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFlow = () => {
    setIsEditMode(!isEditMode);
    toast({
      title: isEditMode ? "Modo de edición desactivado" : "Modo de edición activado",
      description: isEditMode
        ? "Los cambios han sido guardados"
        : "Ahora puedes editar el flujo del agente",
    });
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Diagrama de Flujo & Prueba</h2>
          <p className="text-muted-foreground">
            Prueba tu agente y observa el flujo de la conversación
          </p>
        </div>
        <Button variant={isEditMode ? "default" : "outline"} onClick={handleEditFlow}>
          <Edit className="w-4 h-4 mr-2" />
          {isEditMode ? "Guardar Cambios" : "Editar Flujo"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Flow Diagram Side */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Diagrama de Flujo</h3>
          <div className="space-y-3">
            {flowNodes.map((node, index) => (
              <div key={node.id}>
                <div
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentNode === node.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentNode === node.id ? "bg-primary animate-pulse" : "bg-muted-foreground"
                        }`}
                      />
                      <span className="font-medium text-sm">{node.label}</span>
                    </div>
                    <Badge variant={node.type === "intent" ? "default" : "secondary"}>
                      {node.type}
                    </Badge>
                  </div>
                </div>
                {index < flowNodes.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-4 bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Test Side */}
        <Card className="p-6 bg-card border-border flex flex-col">
          <h3 className="font-semibold text-foreground mb-4">Prueba del Agente</h3>
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.currentNode && (
                      <p className="text-xs opacity-70 mt-2">
                        Nodo: {flowNodes.find((n) => n.id === message.currentNode)?.label}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje de prueba..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete} size="lg">
          Continuar a Creación en Darwin
        </Button>
      </div>
    </div>
  );
};
