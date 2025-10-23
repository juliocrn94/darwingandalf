import { Mic, Square, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
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

  useEffect(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      {/* Status */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {!isRecording && !audioBlob && "Listo para grabar"}
          {isRecording && !isPaused && "Grabando..."}
          {isPaused && "Pausado"}
          {audioBlob && "Grabación completada"}
        </p>
        <p className="text-3xl font-mono font-bold text-foreground">
          {formatTime(recordingTime)}
        </p>
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

      {/* Audio Preview */}
      {audioUrl && (
        <div className="w-full space-y-4">
          <audio src={audioUrl} controls className="w-full" />
          <Button variant="outline" onClick={resetRecording} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Grabar de nuevo
          </Button>
        </div>
      )}
    </div>
  );
};
