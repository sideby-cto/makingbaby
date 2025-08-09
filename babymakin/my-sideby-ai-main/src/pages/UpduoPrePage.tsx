
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { EmailNotice } from "@/components/upduo/EmailNotice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { UpduoIframeDialog } from "@/components/upduo/UpduoIframeDialog";

const UpduoPrePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [upduoDialogOpen, setUpduoDialogOpen] = useState(false);
  const [upduoLoading, setUpduoLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Fetch video URL
    const fetchVideoUrl = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from("videos")
          .createSignedUrl("Helping people find required reflection.mp4", 60 * 60); // 1 hour expiry

        if (error) throw error;
        setVideoUrl(data.signedUrl);
      } catch (err) {
        console.error("Failed to load video URL:", err);
      }
    };
    
    fetchVideoUrl();
  }, []);

  useEffect(() => {
    // Verify authentication once when component loads
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error in Upduo page:", error);
          throw error;
        }
        
        if (!session) {
          console.log("No active session found in Upduo page, redirecting to login");
          toast({
            title: "Authentication required",
            description: "Please log in to access sideby",
          });
          navigate("/login", { state: { returnTo: "/upduo" } });
          return;
        }
        
        console.log("User authenticated in Upduo page");
        setIsLoading(false);
      } catch (err) {
        console.error("Error checking auth in Upduo page:", err);
        toast({
          title: "Error",
          description: "There was a problem checking your login status. Please try again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      setIsVideoPlaying(true);
      videoRef.current.play();
    }
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
  };

  const handleBackClick = () => {
    navigate("/toolbox");
  };

  const openUpduoInIframe = () => {
    setUpduoLoading(true);
    setUpduoDialogOpen(true);
    setTimeout(() => setUpduoLoading(false), 800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verifying your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-20 pb-12">
        <Button 
          variant="outline" 
          onClick={handleBackClick}
          className="mb-6 gap-2 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 font-medium border-2 border-gray-300 dark:border-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Toolbox
        </Button>
        
        <Card className="max-w-4xl mx-auto shadow-lg animate-fade-up border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-b-2 border-amber-200 dark:border-amber-800">
            <CardTitle className="text-3xl flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
              Connect with sideby
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {/* Video section */}
            <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Watch: How to complete your sideby reflection</h3>
              
              {videoUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-900/40">
                      <button 
                        onClick={handleVideoPlay}
                        className="bg-white/90 hover:bg-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
                      >
                        <Play className="h-8 w-8 text-[#FF5733] fill-current" />
                      </button>
                    </div>
                  )}
                  <video 
                    ref={videoRef} 
                    src={videoUrl}
                    className="w-full h-full rounded-lg" 
                    controls={isVideoPlaying}
                    onEnded={handleVideoEnd}
                  >
                    Your browser doesn't support video playback.
                  </video>
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="animate-pulse text-gray-500">Loading video...</div>
                </div>
              )}
            </div>
            
            
            <EmailNotice />
            
            <div className="mt-6">
              <Button 
                className="w-full gap-2 py-6 bg-[#FF5733] hover:bg-[#E04B2A] text-white text-lg font-bold"
                onClick={openUpduoInIframe}
              >
                <ExternalLink className="h-5 w-5" />
                Open Upduo
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <UpduoIframeDialog 
        isOpen={upduoDialogOpen} 
        onClose={() => setUpduoDialogOpen(false)}
        isLoading={upduoLoading}
        mode="fullscreen"
      />
    </div>
  );
};

export default UpduoPrePage;
