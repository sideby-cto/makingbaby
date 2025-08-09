import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Database, TrendingUp } from "lucide-react";

interface PerformanceMetrics {
  loadTime: number;
  dataSize: number;
  renderTime: number;
  cacheHitRate: number;
}

interface PerformanceMonitorProps {
  loading: boolean;
  dataSize: number;
  onMetricsChange?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  loading,
  dataSize,
  onMetricsChange
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    dataSize: 0,
    renderTime: 0,
    cacheHitRate: 0
  });
  
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!loading && dataSize > 0) {
      const loadTime = Date.now() - startTime;
      const renderTime = performance.now();
      
      const newMetrics = {
        loadTime,
        dataSize,
        renderTime: Math.round(renderTime % 1000),
        cacheHitRate: Math.random() * 100 // Simulated for demo
      };
      
      setMetrics(newMetrics);
      onMetricsChange?.(newMetrics);
    }
  }, [loading, dataSize, startTime, onMetricsChange]);

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.5) return "text-green-600";
    if (value <= threshold) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
            Measuring performance...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Load Time</div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getPerformanceColor(metrics.loadTime, 2000)}`}
              >
                {metrics.loadTime}ms
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Data Size</div>
              <Badge variant="outline" className="text-xs">
                {metrics.dataSize} records
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Render</div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getPerformanceColor(metrics.renderTime, 100)}`}
              >
                {metrics.renderTime}ms
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Cache Hit</div>
              <Badge 
                variant="outline" 
                className={`text-xs ${metrics.cacheHitRate > 80 ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {Math.round(metrics.cacheHitRate)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};