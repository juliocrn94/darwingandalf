import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, FileText, Code } from "lucide-react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HandoffData } from "@/types/agent";

interface FindHandoffsStepProps {
  onDataChange: (data: HandoffData | null) => void;
}

export const FindHandoffsStep = ({ onDataChange }: FindHandoffsStepProps) => {
  const [textInput, setTextInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processHandoff = async (type: HandoffData["type"], content: Blob | string, metadata?: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-handoff", {
        body: { type, content, metadata }
      });

      if (error) throw error;

      if (data?.handoff) {
        const handoffData: HandoffData = {
          type,
          content,
          metadata: {
            ...metadata,
            handoffId: data.handoff.id
          }
        };
        onDataChange(handoffData);
        
        toast({
          title: "Handoff procesado",
          description: "Tu handoff ha sido procesado exitosamente",
        });
      }
    } catch (error) {
      console.error("Error processing handoff:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el handoff",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioRecorded = (blob: Blob) => {
    processHandoff("audio_recording", blob, { duration: 0 });
  };

  const handleAudioUploaded = (file: File) => {
    processHandoff("audio_file", file, { 
      fileName: file.name, 
      fileSize: file.size 
    });
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      processHandoff("text", textInput, {});
    }
  };

  const handleJsonSubmit = () => {
    try {
      JSON.parse(jsonInput);
      processHandoff("json", jsonInput, {});
    } catch {
      toast({
        title: "JSON inválido",
        description: "Por favor, ingresa un JSON válido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Find Handoffs
        </h2>
        <p className="text-muted-foreground">
          Describe tu agente mediante audio, texto o JSON para encontrar bases similares
        </p>
      </div>

      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audio">
            <Mic className="w-4 h-4 mr-2" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Subir
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="w-4 h-4 mr-2" />
            Texto
          </TabsTrigger>
          <TabsTrigger value="json">
            <Code className="w-4 h-4 mr-2" />
            JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-4">
          <Card className="p-6">
            <AudioRecorder 
              onRecordingComplete={handleAudioRecorded}
            />
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <AudioUploader 
              onFileSelect={handleAudioUploaded}
            />
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card className="p-6 space-y-4">
            <Textarea
              placeholder="Describe el agente que necesitas crear..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <Button 
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Procesando..." : "Procesar Texto"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card className="p-6 space-y-4">
            <Textarea
              placeholder='{"industry": "retail", "description": "..."}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              className="font-mono resize-none"
            />
            <Button 
              onClick={handleJsonSubmit}
              disabled={!jsonInput.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Procesando..." : "Procesar JSON"}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
