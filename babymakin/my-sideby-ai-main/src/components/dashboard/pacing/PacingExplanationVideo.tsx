
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, PauseCircle, PlayCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PacingExplanationVideoProps {
  buttonText?: string;
  className?: string;
  videoPath?: string;
  storageBucket?: string;
}

export const PacingExplanationVideo = ({
  buttonText = "Watch explanation",
  className,
  videoPath = "pacing.MOV",
  storageBucket = "videos"
}: PacingExplanationVideoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch video URL from storage when dialog opens
  useEffect(() => {
    if (isOpen && !videoUrl) {
      fetchVideoUrl();
    }
  }, [isOpen]);
  
  const fetchVideoUrl = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .storage
        .from(storageBucket)
        .createSignedUrl(videoPath, 60 * 60); // 1 hour expiry

      if (error) throw error;
      setVideoUrl(data.signedUrl);
      setError(null);
    } catch (err: any) {
      console.error(`Error loading ${videoPath} video:`, err);
      setError(err.message || 'Failed to load explanation video');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    setIsInitialRender(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Play className="h-3 w-3 mr-1" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Learning Pace Explanation</DialogTitle>
            <DialogDescription>
              Watch this short video to understand how learning paces work
            </DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video bg-black rounded-md relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="animate-pulse">Loading video...</div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-sm text-white">
                <p>Couldn't load the video.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchVideoUrl} 
                  className="mt-2 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video 
                  id="explanation-video"
                  ref={videoRef}
                  className={cn(
                    "w-full h-full rounded-md transition-all duration-1000",
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
