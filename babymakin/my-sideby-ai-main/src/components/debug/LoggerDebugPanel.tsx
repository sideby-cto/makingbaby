
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLoggerContext } from '@/contexts/LoggerContext';
import { useLogger } from '@/hooks/useLogger';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Define the PerformanceMemory interface for better type safety
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const LoggerDebugPanel = () => {
  const { config, isDebugMode, enableDebugMode, disableDebugMode } = useLoggerContext();
  const logger = useLogger('LoggerDebugPanel');
  const performanceMonitor = usePerformanceMonitor('LoggerDebugPanel');
  const [memoryUsage, setMemoryUsage] = useState<PerformanceMemory | null>(null);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        setMemoryUsage((performance as any).memory as PerformanceMemory);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 2000);
    return () => clearInterval(interval);
  }, []);

  const testLogs = () => {
    logger.debug('Debug message test', { timestamp: new Date() });
    logger.info('Info message test', { component: 'LoggerDebugPanel' });
    logger.warn('Warning message test', { level: 'warning' });
    logger.error('Error message test', { type: 'test_error' });
  };

  const testPerformance = () => {
    performanceMonitor.startMeasure();
    
    // Simulate heavy computation
    const start = performance.now();
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    
    performanceMonitor.endMeasure();
    
    logger.info('Performance test completed', {
      computationTime: `${(performance.now() - start).toFixed(2)}ms`,
      result: result.toFixed(2),
      averageRenderTime: `${performanceMonitor.getAverageRenderTime().toFixed(2)}ms`,
    });
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Logger Debug Panel
          <Badge variant={isDevelopment ? 'default' : 'secondary'}>
            {isDevelopment ? 'Development' : 'Production'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Debug Mode</span>
          <Switch
            checked={isDebugMode}
            onCheckedChange={(checked) => {
              if (checked) {
                enableDebugMode();
              } else {
                disableDebugMode();
              }
            }}
          />
        </div>
        
        <div className="space-y-2">
          <span className="text-sm font-medium">Enabled Log Levels:</span>
          <div className="flex flex-wrap gap-1">
            {config.enabledLevels?.map((level) => (
              <Badge key={level} variant="outline" className="text-xs">
                {level}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testLogs} 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            Test Logs
          </Button>
          <Button 
            onClick={testPerformance} 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            Test Performance
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Console logging: {config.enableConsoleLogging ? 'enabled' : 'disabled'}</p>
          <p>Remote logging: {config.enableRemoteLogging ? 'enabled' : 'disabled'}</p>
          <p>Render count: {performanceMonitor.renderCount}</p>
          <p>Avg render time: {performanceMonitor.getAverageRenderTime().toFixed(2)}ms</p>
          {memoryUsage && (
            <>
              <p>Memory used: {(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</p>
              <p>Memory limit: {(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
