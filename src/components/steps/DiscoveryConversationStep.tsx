import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { Send, Mic, Upload, MessageSquare, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DiscoveryData {
  companyWebsite?: string;
  companyDescription?: string;
  agentPurpose?: string;
  integrations?: string[];
  idealConversations?: string[];
  faq?: string[];
  excludedServices?: string[];
  requiredCustomerInfo?: string[];
  agentName?: string;
  businessHours?: string;
}

interface DiscoveryConversationStepProps {
  onDiscoveryComplete: (data: DiscoveryData, sessionId: string) => void;
}

export const DiscoveryConversationStep = ({ onDiscoveryComplete }: DiscoveryConversationStepProps) => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente para crear un agente conversacional perfecto para tu empresa. Vamos a conversar para entender exactamente qué necesitas. Para empezar, ¿cuál es el sitio web de tu empresa?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData>({});
  const [sessionId, setSessionId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"text" | "audio" | "upload">("text");

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const requiredFields = [
    { key: "companyWebsite", label: "Sitio web" },
    { key: "agentPurpose", label: "Propósito del agente" },
    { key: "integrations", label: "Integraciones" },
    { key: "agentName", label: "Nombre del agente" },
  ];

  const completedFields = requiredFields.filter(
    (field) => discoveryData[field.key as keyof DiscoveryData]
  ).length;

  const isDiscoveryComplete = completedFields === requiredFields.length;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


  const handleSendMessage = async (content: string) => {
    if (!content.trim() && activeTab === "text") return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      content: content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-discovery", {
        body: {
          messages: [...messages, userMessage],
          currentData: discoveryData,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.extractedData) {
        setDiscoveryData((prev) => ({ ...prev, ...data.extractedData }));
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.isComplete) {
        toast({
          title: "Discovery completado",
          description: "Tenemos toda la información necesaria para continuar",
        });
      }
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


  const handleComplete = () => {
    if (isDiscoveryComplete) {
      onDiscoveryComplete(discoveryData, sessionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Conversación de Discovery</h2>
        <p className="text-muted-foreground">
          Conversemos para entender tu negocio y diseñar el agente perfecto
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Progress Tracker - Collapsible on Left */}
        <Card className="w-full lg:w-64 lg:sticky lg:top-6 p-4 bg-gradient-card border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Progreso</h3>
            <Badge variant={isDiscoveryComplete ? "default" : "secondary"} className="text-xs">
              {completedFields}/{requiredFields.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {requiredFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2 text-sm">
                {discoveryData[field.key as keyof DiscoveryData] ? (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted flex-shrink-0" />
                )}
                <span className="text-muted-foreground text-xs">{field.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Interface */}
        <div className="flex-1 w-full">
          <Card className="p-6 bg-card border-border">
        <ScrollArea className="h-[400px] pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                    <ReactMarkdown 
                      components={{
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
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
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="text">
              <MessageSquare className="w-4 h-4 mr-2" />
              Texto
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Mic className="w-4 h-4 mr-2" />
              Grabar
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Subir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu mensaje aquí..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage(inputText)}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage(inputText)}
                disabled={isLoading || !inputText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="audio">
            <AudioRecorder onTranscriptionComplete={(text) => {
              setActiveTab("text");
              handleSendMessage(text);
            }} />
          </TabsContent>

          <TabsContent value="upload">
            <AudioUploader onFileSelect={async (file) => {
              setIsLoading(true);
              setActiveTab("text");
              try {
                const formData = new FormData();
                formData.append("audio", file);

                const response = await fetch(`${supabaseUrl}/functions/v1/transcribe-audio`, {
                  method: "POST",
                  headers: {
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`,
                  },
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error("Error al transcribir el audio");
                }

                const { transcription } = await response.json();
                await handleSendMessage(transcription);
              } catch (error) {
                console.error("Error processing audio file:", error);
                toast({
                  title: "Error",
                  description: "No se pudo procesar el archivo de audio",
                  variant: "destructive",
                });
              } finally {
                setIsLoading(false);
              }
            }} />
          </TabsContent>
        </Tabs>
          </Card>

          {isDiscoveryComplete && (
            <div className="w-full mt-6">
              <Button 
                onClick={handleComplete} 
                size="lg" 
                className="w-full gap-2 py-6 text-lg font-semibold"
              >
                Continuar a Selección de Template
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
