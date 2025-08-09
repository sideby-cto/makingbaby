
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, AlertCircle, Maximize, Minimize, X, ArrowLeft, Menu, CheckSquare, Users, Lightbulb, BookOpen, Settings, User, Monitor } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Clock, Video, Mic } from "lucide-react";
import { UpduoUIConfig } from "@/types/upduo";
import { useUpduoEmbedding } from "@/hooks/useUpduoEmbedding";
import { useUpduoSessionEvents } from "@/hooks/useUpduoSessionEvents";
import { SessionCompletionDialog } from "@/components/dashboard/onboarding/components/SessionCompletionDialog";

interface UpduoIframeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onError?: (error: string) => void;
  onPartialReflectionDetected?: (hasPartial: boolean) => void;
  communityCode?: string;
  mode?: 'dialog' | 'fullscreen' | 'embedded';
  partnerName?: string;
  sessionType?: 'reflection' | 'conversation' | 'planning';
  uiConfig?: UpduoUIConfig;
}

type ViewMode = 'dialog' | 'fullscreen' | 'pip';

export const UpduoIframeDialog: React.FC<UpduoIframeDialogProps> = ({
  isOpen,
  onClose,
  isLoading = false,
  onError,
  onPartialReflectionDetected,
  communityCode = "washington",
  mode = 'fullscreen',
  partnerName,
  sessionType = 'reflection',
  uiConfig
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('fullscreen'); // Default to fullscreen
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionData, setCompletionData] = useState<{
    isFirstReflection: boolean;
    partnerName?: string;
    showMatchNotification: boolean;
  }>({ isFirstReflection: false, showMatchNotification: false });
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Use the embedding hook for enhanced iframe management
  const { iframeRef, handleIframeLoad, buildIframeUrl } = useUpduoEmbedding({
    onError
  });

  // Listen for session completion events
  useUpduoSessionEvents({
    onSessionCompleted: (event) => {
      console.log('Session completed:', event);
      // Show completion dialog for reflection sessions
      if (sessionType === 'reflection') {
        setCompletionData({
          isFirstReflection: event.isFirstReflection || false,
          partnerName: undefined, // Will be populated if a match is found
          showMatchNotification: false // Will be updated when match notification arrives
        });
        setShowCompletionDialog(true);
      }
    },
    onFirstReflectionCompleted: () => {
      console.log('First reflection completed - team member matching will occur automatically');
      // Update completion data to show it's a first reflection
      setCompletionData(prev => ({ 
        ...prev, 
        isFirstReflection: true 
      }));
    }
  });

  const handleOpenInNewTab = () => {
    const url = `https://web.upduo.com?communityCode=${encodeURIComponent(communityCode)}`;
    window.open(url, "_blank");
    onClose();
  };

  const handleIframeError = () => {
    setIframeError(true);
    onError?.("Unable to load Upduo content");
  };

  const handlePermissionError = () => {
    setPermissionError(true);
    onError?.("Camera/microphone permissions required for Upduo sessions");
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  const handleClose = () => {
    setViewMode('fullscreen');
    setPipPosition({ x: 20, y: 20 });
    setShowCompletionDialog(false);
    setCompletionData({ isFirstReflection: false, showMatchNotification: false });
    onClose();
  };

  const handleCompletionDialogClose = () => {
    setShowCompletionDialog(false);
    setCompletionData({ isFirstReflection: false, showMatchNotification: false });
  };

  const handleMinimize = () => {
    setViewMode('pip');
  };

  const handleMaximize = () => {
    setViewMode('fullscreen');
  };

  // Navigation helpers
  const handleBackToSideby = () => {
    handleClose(); // Close the Upduo dialog
    navigate('/dashboard');
  };

  const handleNavigateTo = (path: string, tab?: string) => {
    handleClose(); // Close the Upduo dialog
    if (tab) {
      navigate(`${path}?tab=${tab}`);
    } else {
      navigate(path);
    }
  };

  const navigationItems = [
    {
      label: "Dashboard Home",
      icon: CheckSquare,
      onClick: () => handleNavigateTo('/dashboard')
    },
    {
      label: "Tasks",
      icon: CheckSquare,
      onClick: () => handleNavigateTo('/dashboard', 'tasks')
    },
    {
      label: "Partners",
      icon: Users,
      onClick: () => handleNavigateTo('/dashboard', 'partners')
    },
    {
      label: "Sessions",
      icon: BookOpen,
      onClick: () => handleNavigateTo('/dashboard', 'sessions')
    },
    {
      label: "Ideas",
      icon: Lightbulb,
      onClick: () => handleNavigateTo('/dashboard', 'ideas')
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => handleNavigateTo('/settings')
    },
    {
      label: "Your Data",
      icon: User,
      onClick: () => handleNavigateTo('/your-data')
    }
  ];

  // PiP dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'pip') return;
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || viewMode !== 'pip') return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep PiP window within viewport bounds
    const maxX = window.innerWidth - 400; // PiP width
    const maxY = window.innerHeight - 300; // PiP height
    
    setPipPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setIframeError(false);
      setPermissionError(false);
      setViewMode('fullscreen');
      setPipPosition({ x: 20, y: 20 });
      setShowCompletionDialog(false);
      setCompletionData({ isFirstReflection: false, showMatchNotification: false });
    }
  }, [isOpen]);

  // Handle ESC key to exit fullscreen or close PiP
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (viewMode === 'fullscreen') {
          handleMinimize();
        } else if (viewMode === 'pip') {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, viewMode]);

  // Mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const iframeUrl = buildIframeUrl('https://web.upduo.com', communityCode);

  // Handle embedded mode - enhanced inline implementation
  if (mode === 'embedded') {
    const [iframeErrorEmbedded, setIframeErrorEmbedded] = useState(false);
    const [permissionErrorEmbedded, setPermissionErrorEmbedded] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);

    const handleOpenInNewTabEmbedded = () => {
      const url = `https://web.upduo.com?communityCode=${encodeURIComponent(communityCode)}`;
      window.open(url, "_blank");
    };

    const handleIframeErrorEmbedded = () => {
      setIframeErrorEmbedded(true);
      onError?.("Unable to load Upduo content");
    };

    // Unified tips for all session types
    const unifiedTips = [
      "Your Upduo account is separate from your sideby account. Create an account, using the \"code\" washington",
      "Share 3 or 4 open \"time windows\" you have open.",
      "Go first, it helps!",
      "Try something new with AI between each session."
    ];

    // Session context based on type
    const getSessionContext = () => {
      switch (sessionType) {
        case 'conversation':
          return {
            title: `sideby session with ${partnerName}`,
            subtitle: "Real-time video conversation",
            description: "Connect with your learning partner for a meaningful educational exchange.",
            icon: Users,
            badge: "Live Session",
            badgeVariant: "default" as const,
            tips: unifiedTips
          };
        case 'planning':
          return {
            title: "Session Planning",
            subtitle: "Collaborative session design",
            description: "Work together to plan your next learning experience.",
            icon: Lightbulb,
            badge: "Planning",
            badgeVariant: "secondary" as const,
            tips: unifiedTips
          };
        default:
          return {
            title: "sideby reflection",
            subtitle: "Personal learning reflection",
            description: "Take time to reflect on your teaching practice and learning journey.",
            icon: Monitor,
            badge: "Reflection",
            badgeVariant: "outline" as const,
            tips: unifiedTips
          };
      }
    };

    const sessionContext = getSessionContext();
    const IconComponent = sessionContext.icon;

    return (
      <>
        <div className="space-y-6">
          {/* Session Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{sessionContext.title}</h1>
                <p className="text-muted-foreground">{sessionContext.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={sessionContext.badgeVariant}>{sessionContext.badge}</Badge>
              {sessionStarted && (
                <Badge variant="default" className="animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
          )}>
            {/* Left Sidebar - Context & Tips */}
            {!isMobile && (
              <div className="space-y-4">
                {/* Session Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Info className="h-4 w-4" />
                      Session Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      At the time you and {partnerName || "{partner_first_name}"} agree upon, press the "Enter" button. That'll open the video chat.
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Estimated time: 15-30 min</span>
                    </div>

                    {communityCode && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {communityCode}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tips & Guidelines */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="h-4 w-4" />
                      Tips for Success
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {unifiedTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Requirements */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Monitor className="h-4 w-4" />
                      Technical Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Camera access required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Microphone access required</span>
                    </div>
                    <Separator />
                    <Button
                      onClick={handleOpenInNewTabEmbedded}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Iframe Area */}
            <div className={cn("space-y-4", !isMobile && "lg:col-span-2")}>
              {/* Error Alerts */}
              {(iframeErrorEmbedded || permissionErrorEmbedded) && (
                <div className="space-y-3">
                  {iframeErrorEmbedded && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-amber-800">
                        Having trouble loading the interface? You can{" "}
                        <button 
                          onClick={handleOpenInNewTabEmbedded}
                          className="underline font-medium hover:text-amber-900"
                        >
                          open it in a new tab instead
                        </button>
                        .
                      </AlertDescription>
                    </Alert>
                  )}

                  {permissionErrorEmbedded && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        <div className="space-y-2">
                          <p className="font-medium">Camera and microphone access required</p>
                          <p className="text-sm">
                            Please allow permissions when prompted, or{" "}
                            <button 
                              onClick={handleOpenInNewTabEmbedded}
                              className="underline font-medium hover:text-red-900"
                            >
                              open in a new tab
                            </button>
                            {" "}to continue.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Mobile Tips */}
              {isMobile && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Quick Tips</span>
                    </div>
                    <div className="space-y-2">
                      {unifiedTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Iframe Container */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-muted-foreground">Loading session...</p>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      ref={iframeRef}
                      src={iframeUrl}
                      className="w-full h-full border-0"
                      title={`${sessionContext.title} - Embedded View`}
                      onError={handleIframeErrorEmbedded}
                      onLoad={() => {
                        setSessionStarted(true);
                        handleIframeLoad();
                      }}
                      allow="camera; microphone; autoplay; fullscreen; display-capture"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-camera allow-microphone allow-autoplay"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  )}
                </div>
              </Card>

              {/* Session Actions */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Having issues? Try opening in a new tab for full functionality. You may need to login once more.
                </div>
                <Button onClick={handleOpenInNewTabEmbedded} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  New Tab
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Session completion dialog for embedded mode */}
        <SessionCompletionDialog
          isOpen={showCompletionDialog}
          onClose={handleCompletionDialogClose}
          isFirstReflection={completionData.isFirstReflection}
          partnerName={completionData.partnerName}
          showMatchNotification={completionData.showMatchNotification}
        />
      </>
    );
  }

  // Don't render anything if not open (for dialog/fullscreen modes)
  if (!isOpen) {
    return (
      <SessionCompletionDialog
        isOpen={showCompletionDialog}
        onClose={handleCompletionDialogClose}
        isFirstReflection={completionData.isFirstReflection}
        partnerName={completionData.partnerName}
        showMatchNotification={completionData.showMatchNotification}
      />
    );
  }

  // PiP Mode - Floating window
  if (viewMode === 'pip') {
    return (
      <>
        <div
          className="fixed z-[10000] bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden cursor-move"
          style={{
            left: `${pipPosition.x}px`,
            top: `${pipPosition.y}px`,
            width: '400px',
            height: '300px',
          }}
          onMouseDown={handleMouseDown}
        >
          {/* PiP Header */}
          <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900">sideby reflection</h4>
              {/* Enhanced community code for PiP */}
              <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded uppercase tracking-wide">
                {communityCode}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={handleMaximize}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <Maximize className="h-3 w-3" />
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* PiP Content */}
          <div className="h-[calc(100%-40px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF5733]" />
                  <p className="text-xs text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                className="w-full h-full border-0"
                title="Upduo Reflection Interface - PiP"
                onError={handleIframeError}
                onLoad={handleIframeLoad}
                allow="camera; microphone; autoplay; fullscreen; display-capture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-camera allow-microphone allow-autoplay"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        </div>
        {/* Session completion dialog for PiP mode */}
        <SessionCompletionDialog
          isOpen={showCompletionDialog}
          onClose={handleCompletionDialogClose}
          isFirstReflection={completionData.isFirstReflection}
          partnerName={completionData.partnerName}
          showMatchNotification={completionData.showMatchNotification}
        />
      </>
    );
  }

  // Fullscreen Mode (Default)
  if (viewMode === 'fullscreen') {
    return (
      <>
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          {/* Enhanced Fullscreen header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-700">
            <div className="flex items-center gap-4">
              {/* Back to sideby button */}
              <Button
                onClick={handleBackToSideby}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-brand-primary/20 hover:text-brand-primary gap-2 px-3 py-2 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to sideby</span>
              </Button>
              
              {/* Navigation separator */}
              <div className="h-6 w-px bg-gray-600"></div>
              
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">sideby reflection</h3>
                {/* Enhanced community code display */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-base tracking-wide uppercase">
                    {communityCode}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Navigation dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-800 gap-2"
                  >
                    <Menu className="h-4 w-4" />
                    <span className={isMobile ? "hidden" : ""}>Navigate</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white border border-gray-200 shadow-lg">
                  {navigationItems.slice(0, 5).map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={item.onClick}
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="border-gray-200" />
                  {navigationItems.slice(5).map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <DropdownMenuItem
                        key={index + 5}
                        onClick={item.onClick}
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Existing action buttons */}
              <Button
                onClick={handleOpenInNewTab}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {!isMobile && "New Tab"}
              </Button>
              <Button
                onClick={handleMinimize}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800"
                title="Minimize to Picture-in-Picture"
              >
                <Minimize className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error alerts in fullscreen */}
          {(iframeError || permissionError) && (
            <div className="px-4 py-2 bg-gray-800">
              {iframeError && (
                <Alert className="border-amber-200 bg-amber-50 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-amber-800">
                    Having trouble loading the reflection interface? You can{" "}
                    <button 
                      onClick={handleOpenInNewTab}
                      className="underline font-medium hover:text-amber-900"
                    >
                      open it in a new tab instead
                    </button>
                    .
                  </AlertDescription>
                </Alert>
              )}

              {permissionError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    <div className="space-y-2">
                      <p className="font-medium">Camera and microphone access required</p>
                      <p className="text-sm">
                        Please allow permissions when prompted, or{" "}
                        <button 
                          onClick={handleOpenInNewTab}
                          className="underline font-medium hover:text-red-900"
                        >
                          open in a new tab
                        </button>
                        {" "}to complete your reflection.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Community Code Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-3 px-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              {/* Return to sideby button */}
              <Button
                onClick={handleBackToSideby}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Return to sideby</span>
              </Button>
              
              {/* Community code display */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-lg font-bold tracking-wider uppercase">
                  Community Code: {communityCode}
                </span>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              
              {/* Spacer to balance layout */}
              <div className="w-[140px]"></div>
            </div>
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          </div>

          {/* Fullscreen iframe */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#FF5733]" />
                  <p className="text-gray-600">Loading Upduo...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Connecting to community: <span className="font-bold text-blue-600">{communityCode}</span>
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                className="w-full h-full border-0 overflow-auto"
                title="Upduo Reflection Interface"
                onError={handleIframeError}
                onLoad={handleIframeLoad}
                allow="camera; microphone; autoplay; fullscreen; display-capture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-camera allow-microphone allow-autoplay"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        </div>
        {/* Session completion dialog for fullscreen mode */}
        <SessionCompletionDialog
          isOpen={showCompletionDialog}
          onClose={handleCompletionDialogClose}
          isFirstReflection={completionData.isFirstReflection}
          partnerName={completionData.partnerName}
          showMatchNotification={completionData.showMatchNotification}
        />
      </>
    );
  }

  // This shouldn't be reached, but fallback to null
  return null;
};
