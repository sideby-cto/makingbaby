
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Info, PauseCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExplanationVideoProps {
  className?: string;
  videoPath?: string;
  buttonText?: string;
  storageBucket?: string;
}

export const PacingExplanationVideo = ({ 
  className, 
  videoPath = "pacing.MOV",
  buttonText = "Watch video explanation",
  storageBucket = "videos"
}: ExplanationVideoProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fetch video URL from storage
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .storage
          .from(storageBucket)
          .createSignedUrl(videoPath, 60 * 60); // 1 hour expiry

        if (error) throw error;
        setVideoUrl(data.signedUrl);
      } catch (err: any) {
        console.error(`Error loading ${videoPath} video:`, err);
        setError(err.message || 'Failed to load explanation video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUrl();
  }, [videoPath, storageBucket]);

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Close the popover with a slight delay to allow for a smooth fade out
    setTimeout(() => {
      setIsOpen(false);
    }, 500);
  };

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    setIsInitialRender(false);
  };

  return (
    <div className={cn("inline-block", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Info className="h-4 w-4" />
            {buttonText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-black/90 border-0 transition-opacity duration-500" side="top">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-white">
              <div className="animate-pulse">Loading video...</div>
            </div>
          ) : error ? (
            <div className="h-32 flex flex-col items-center justify-center p-4 text-sm text-white">
              <p>Couldn't load the video.</p>
            </div>
          ) : (
            <div className="relative">
              <video 
                id="explanation-video"
                ref={videoRef}
                className={cn(
                  "w-full rounded-md transition-all duration-1000",
                  isInitialRender && "rotate-180",
                  isVideoLoaded && "animate-[spin_1s_ease-in-out_forwards]"
                )}
                src={videoUrl || undefined}
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnded}
                onLoadedData={handleVideoLoaded}
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="rounded-full h-9 w-9 p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <PauseCircle className="h-5 w-5 text-white" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
