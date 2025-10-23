import { Mic, Upload, FileText, FileJson } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { cn } from "@/lib/utils";

type InputMethod = "record" | "upload" | "text" | "json" | null;

interface HandoffData {
  type: "audio_recording" | "audio_file" | "text" | "json";
  content: Blob | string;
  metadata?: {
    duration?: number;
    fileName?: string;
    fileSize?: number;
  };
}

interface StepOneProps {
  onDataChange: (data: HandoffData | null) => void;
}

export const StepOne = ({ onDataChange }: StepOneProps) => {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>(null);
  const [textContent, setTextContent] = useState("");
  const [jsonContent, setJsonContent] = useState("");

  const handleMethodSelect = (method: InputMethod) => {
    setSelectedMethod(method);
    onDataChange(null);
  };

  const handleAudioRecording = (text: string) => {
    onDataChange({
      type: "text",
      content: text,
    });
  };

  const handleAudioUpload = (file: File) => {
    onDataChange({
      type: "audio_file",
      content: file,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
      },
    });
  };

  const handleTextChange = (text: string) => {
    setTextContent(text);
    if (text.trim()) {
      onDataChange({
        type: "text",
        content: text,
      });
    } else {
      onDataChange(null);
    }
  };

  const handleJsonChange = (json: string) => {
    setJsonContent(json);
    if (json.trim()) {
      onDataChange({
        type: "json",
        content: json,
      });
    } else {
      onDataChange(null);
    }
  };

  const inputOptions = [
    {
      id: "record" as const,
      icon: Mic,
      title: "Grabar Audio",
      description: "Describe el handoff con tu voz",
    },
    {
      id: "upload" as const,
      icon: Upload,
      title: "Subir Archivo de Audio",
      description: "MP3, WAV, M4A u otros formatos",
    },
    {
      id: "text" as const,
      icon: FileText,
      title: "Escribir Handoff",
      description: "Describe el contexto en texto libre",
    },
    {
      id: "json" as const,
      icon: FileJson,
      title: "Pegar JSON Estructurado",
      description: "Para usuarios avanzados",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Cargar Información del Handoff
        </h2>
        <p className="text-muted-foreground">
          Elige cómo quieres proporcionar la información del handoff del cliente
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {inputOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMethod === option.id;
          const isMinimized = selectedMethod && selectedMethod !== option.id;

          return (
            <Card
              key={option.id}
              className={cn(
                "transition-all duration-300 cursor-pointer border-2",
                isSelected
                  ? "border-primary bg-primary/5 md:col-span-2"
                  : isMinimized
                  ? "border-border bg-card hover:border-primary/30"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-card"
              )}
              onClick={() => !isSelected && handleMethodSelect(option.id)}
            >
              <div className="p-6">
                {isMinimized ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {option.id === "record" && (
                          <AudioRecorder onTranscriptionComplete={handleAudioRecording} />
                        )}
                        {option.id === "upload" && (
                          <AudioUploader onFileSelect={handleAudioUpload} />
                        )}
                        {option.id === "text" && (
                          <Textarea
                            placeholder="Describe el handoff del cliente: industria, objetivos, tono, canales de comunicación, metas, pain points..."
                            className="min-h-[300px]"
                            value={textContent}
                            onChange={(e) => handleTextChange(e.target.value)}
                          />
                        )}
                        {option.id === "json" && (
                          <div className="space-y-4">
                            <Textarea
                              placeholder='{"client": "...", "industry": "...", "objective": "..."}'
                              className="min-h-[300px] font-mono text-sm"
                              value={jsonContent}
                              onChange={(e) => handleJsonChange(e.target.value)}
                            />
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Ver ejemplo de estructura JSON
                              </summary>
                              <pre className="mt-2 p-4 bg-muted rounded-md text-muted-foreground overflow-x-auto">
{`{
  "client": "AgroFinance Corp",
  "industry": "Agriculture, Finance",
  "objective": "Lead generation through consultative chat",
  "tone": "Professional, empathetic",
  "channels": ["web_chat", "whatsapp"],
  "goals": ["Capture lead info", "Schedule consultations"],
  "pain_points": ["Complex product info", "Long sales cycles"]
}`}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
