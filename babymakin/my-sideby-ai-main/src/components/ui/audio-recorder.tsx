
import * as React from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AudioRecorderProps extends React.HTMLAttributes<HTMLDivElement> {
  onAudioCaptured: (audioData: string) => void;
  isProcessing?: boolean;
}

export const AudioRecorder = React.forwardRef<HTMLDivElement, AudioRecorderProps>(
  ({ className, onAudioCaptured, isProcessing = false, ...props }, ref) => {
    const [isRecording, setIsRecording] = React.useState(false);
    const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = React.useState(0);
    const timerRef = React.useRef<number | null>(null);

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        setAudioChunks([]);
        setIsRecording(true);
        setRecordingTime(0);
        
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            setAudioChunks((prev) => [...prev, event.data]);
          }
        });
        
        mediaRecorder.start();
        
        // Start timer
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    React.useEffect(() => {
      return () => {
        // Clean up on component unmount
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [isRecording]);

    React.useEffect(() => {
      if (audioChunks.length > 0 && !isRecording) {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove the data URL prefix to get just the base64 string
          const base64Audio = base64data.split(",")[1];
          onAudioCaptured(base64Audio);
        };
      }
    }, [audioChunks, isRecording, onAudioCaptured]);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div 
        ref={ref}
        className={cn("flex flex-col items-center space-y-2", className)}
        {...props}
      >
        <div className="flex items-center space-x-2">
          {isRecording ? (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Stop ({formatTime(recordingTime)})</span>
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span>{isProcessing ? "Processing" : "Record availability"}</span>
            </Button>
          )}
        </div>
        {isRecording && (
          <div className="text-xs text-muted-foreground animate-pulse">
            Recording... speak clearly about your availability
          </div>
        )}
      </div>
    );
  }
);

AudioRecorder.displayName = "AudioRecorder";
