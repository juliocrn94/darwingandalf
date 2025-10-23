import { Mic, Square, Pause, Play, RotateCcw, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export const AudioRecorder = ({ onTranscriptionComplete }: AudioRecorderProps) => {
  const { toast } = useToast();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formatTime,
  } = useAudioRecorder();

  // Transcribir automáticamente cuando se complete la grabación
  useEffect(() => {
    if (audioBlob && !transcription) {
      transcribeAudio();
    }
  }, [audioBlob]);

  const transcribeAudio = async () => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob!, `recording-${Date.now()}.webm`);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

      const { transcription: text } = await response.json();
      setTranscription(text);
    } catch (error) {
      console.error("Error transcribing:", error);
      toast({
        title: "Error",
        description: "No se pudo transcribir el audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendTranscription = () => {
    if (transcription.trim()) {
      onTranscriptionComplete(transcription);
      setTranscription("");
      resetRecording();
    }
  };

  const handleReset = () => {
    setTranscription("");
    resetRecording();
  };

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      {/* Status */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {!isRecording && !audioBlob && "Listo para grabar"}
          {isRecording && !isPaused && "Grabando..."}
          {isPaused && "Pausado"}
          {isTranscribing && "Transcribiendo audio..."}
          {transcription && "Edita el texto antes de enviar"}
        </p>
        {!transcription && (
          <p className="text-3xl font-mono font-bold text-foreground">
            {formatTime(recordingTime)}
          </p>
        )}
      </div>

      {/* Main Record Button */}
      {!audioBlob && (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
            isRecording
              ? "bg-destructive hover:bg-destructive/90 animate-pulse shadow-lg"
              : "bg-primary hover:bg-primary/90 shadow-glow"
          )}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      )}

      {/* Controls */}
      {isRecording && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={isPaused ? resumeRecording : pauseRecording}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Reanudar
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isTranscribing && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Transcribiendo audio...</span>
        </div>
      )}

      {/* Transcription Editor */}
      {transcription && !isTranscribing && (
        <div className="w-full space-y-4">
          {/* Audio player para revisar */}
          <audio src={audioUrl} controls className="w-full" />
          
          {/* Textarea editable con transcripción */}
          <Textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Texto transcrito..."
            className="min-h-[120px]"
          />
          
          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button onClick={handleSendTranscription} className="flex-1" disabled={!transcription.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Enviar mensaje
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
