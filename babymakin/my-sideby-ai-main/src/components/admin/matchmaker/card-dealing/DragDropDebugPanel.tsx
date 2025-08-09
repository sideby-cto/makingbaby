
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DragDropEvent {
  id: string;
  timestamp: Date;
  type: 'dragstart' | 'dragend' | 'dragover' | 'drop' | 'error';
  data?: any;
  element?: string;
}

export const DragDropDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<DragDropEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const addEvent = (type: DragDropEvent['type'], data?: any, element?: string) => {
    if (!isMonitoring) return;
    
    const event: DragDropEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      data,
      element
    };
    
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const testDragSupport = () => {
    const testDiv = document.createElement('div');
    const isDragSupported = 'draggable' in testDiv && 'ondragstart' in testDiv && 'ondrop' in testDiv;
    
    addEvent('error', {
      dragSupported: isDragSupported,
      userAgent: navigator.userAgent,
      touchSupported: 'ontouchstart' in window
    }, 'browser-test');
  };

  useEffect(() => {
    if (!isMonitoring) return;

    // Monitor drag events globally
    const handleDragStart = (e: DragEvent) => {
      addEvent('dragstart', {
        types: Array.from(e.dataTransfer?.types || []),
        effectAllowed: e.dataTransfer?.effectAllowed
      }, (e.target as Element)?.tagName);
    };

    const handleDragEnd = (e: DragEvent) => {
      addEvent('dragend', {
        dropEffect: e.dataTransfer?.dropEffect
      }, (e.target as Element)?.tagName);
    };

    const handleDragOver = (e: DragEvent) => {
      // Only log every 10th dragover to avoid spam
      if (Math.random() < 0.1) {
        addEvent('dragover', {
          types: Array.from(e.dataTransfer?.types || [])
        }, (e.target as Element)?.tagName);
      }
    };

    const handleDrop = (e: DragEvent) => {
      addEvent('drop', {
        types: Array.from(e.dataTransfer?.types || []),
        items: e.dataTransfer?.items.length
      }, (e.target as Element)?.tagName);
    };

    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [isMonitoring]);

  const getEventColor = (type: DragDropEvent['type']) => {
    switch (type) {
      case 'dragstart': return 'bg-blue-100 text-blue-800';
      case 'dragend': return 'bg-green-100 text-green-800';
      case 'dragover': return 'bg-yellow-100 text-yellow-800';
      case 'drop': return 'bg-purple-100 text-purple-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-orange-900">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Drag & Drop Debug Panel
                <Badge variant="outline" className="ml-2">
                  {events.length} events
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMonitoring(!isMonitoring);
                  }}
                  variant="outline"
                  size="sm"
                  className={isMonitoring ? 'bg-green-100' : 'bg-red-100'}
                >
                  {isMonitoring ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {isMonitoring ? 'Monitoring' : 'Paused'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={clearEvents} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear Events
              </Button>
              <Button onClick={testDragSupport} variant="outline" size="sm">
                <Bug className="h-4 w-4 mr-1" />
                Test Browser Support
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No drag events recorded yet. {!isMonitoring && 'Monitoring is paused.'}
                </p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getEventColor(event.type)}>
                        {event.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {event.element && (
                      <p className="text-sm text-gray-600 mb-1">
                        Element: <code className="bg-gray-100 px-1 rounded">{event.element}</code>
                      </p>
                    )}
                    
                    {event.data && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Event Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
