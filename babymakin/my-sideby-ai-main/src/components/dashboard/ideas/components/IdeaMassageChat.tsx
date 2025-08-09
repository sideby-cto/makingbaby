import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ThinkingButton } from '@/components/ui/thinking-button';
import { Send, ChevronDown, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useMassagePrompts } from '../hooks/useMassagePrompts';
import { MassageMessage } from './MassageMessage';
import { SavedItem } from '../types';

interface IdeaMassageChatProps {
  selectedItem: SavedItem;
  onContentUpdate?: (newContent: string) => void;
  onRatingUpdate?: (field: 'excitement_level' | 'alignment_level', value: number) => void;
}

const QUICK_PROMPTS = [
  "Make this shorter and more concise",
  "Turn this into a blog post",
  "Adapt this for a different audience",
  "Add more interactive elements",
  "Make this more engaging",
  "Provide implementation steps"
];

export const IdeaMassageChat: React.FC<IdeaMassageChatProps> = ({ 
  selectedItem, 
  onContentUpdate,
  onRatingUpdate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState<string | null>(null);
  const [suggestedRatings, setSuggestedRatings] = useState<{ excitement_level: number; alignment_level: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    massagePrompts,
    isLoading,
    error,
    sendMassagePrompt,
    fetchMassagePrompts,
    clearError,
  } = useMassagePrompts();

  // Fetch existing massage prompts when dialog opens
  useEffect(() => {
    if (isOpen && selectedItem) {
      fetchMassagePrompts(selectedItem.id);
    }
  }, [isOpen, selectedItem, fetchMassagePrompts]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [massagePrompts]);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || isLoading) return;

    try {
      const result = await sendMassagePrompt(prompt.trim(), selectedItem.content, selectedItem.id);
      setPrompt('');
      
      // If there are suggested ratings, show them
      if (result.suggestedRatings) {
        setSuggestedRatings(result.suggestedRatings);
      }
    } catch (error) {
      console.error('Error sending prompt:', error);
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleReplaceContent = (newContent: string) => {
    setShowReplaceConfirm(newContent);
  };

  const confirmReplace = () => {
    if (showReplaceConfirm && onContentUpdate) {
      onContentUpdate(showReplaceConfirm);
      setShowReplaceConfirm(null);
    }
  };

  const cancelReplace = () => {
    setShowReplaceConfirm(null);
  };

  const handleApplyRating = (field: 'excitement_level' | 'alignment_level', value: number) => {
    if (onRatingUpdate) {
      // Ensure the rating is within the valid 1-3 range
      const clampedValue = Math.min(Math.max(value, 1), 3);
      onRatingUpdate(field, clampedValue);
    }
    setSuggestedRatings(null);
  };

  const handleDismissRatings = () => {
    setSuggestedRatings(null);
  };

  return (
    <Card className="w-full border-2 border-sideby-orange-200 bg-gradient-to-r from-sideby-orange-50 to-sideby-blue-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-sideby-orange-50/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg font-bold text-sideby-text-primary">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sideby-orange-500" />
                Massage Your Idea
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-sideby-text-muted" />
              ) : (
                <ChevronRight className="h-5 w-5 text-sideby-text-muted" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearError}
                    className="text-red-600 hover:text-red-700 p-0 h-auto mt-1"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            {/* Suggested Ratings */}
            {suggestedRatings && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">AI Suggested Rating Changes</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Based on your request, the AI suggests updating your ratings:
                </p>
                 <div className="space-y-2 mb-3">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-blue-900">Excitement Level:</span>
                     <span className="text-sm text-blue-800">{Math.min(Math.max(suggestedRatings.excitement_level, 1), 3)}/3</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-blue-900">Alignment Level:</span>
                     <span className="text-sm text-blue-800">{Math.min(Math.max(suggestedRatings.alignment_level, 1), 3)}/3</span>
                   </div>
                 </div>
                <div className="flex gap-2">
                   <Button 
                     size="sm" 
                     onClick={() => {
                       handleApplyRating('excitement_level', Math.min(Math.max(suggestedRatings.excitement_level, 1), 3));
                       handleApplyRating('alignment_level', Math.min(Math.max(suggestedRatings.alignment_level, 1), 3));
                     }}
                     className="bg-blue-600 hover:bg-blue-700 text-white"
                   >
                     Apply Both
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => handleApplyRating('excitement_level', Math.min(Math.max(suggestedRatings.excitement_level, 1), 3))}
                   >
                     Apply Excitement Only
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => handleApplyRating('alignment_level', Math.min(Math.max(suggestedRatings.alignment_level, 1), 3))}
                   >
                     Apply Alignment Only
                   </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDismissRatings}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            {/* Replace Content Confirmation */}
            {showReplaceConfirm && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Replace Original Content?</h4>
                <p className="text-sm text-amber-800 mb-3">
                  This will replace your original idea content with the AI response. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={confirmReplace}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Replace
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelReplace}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="max-h-96 overflow-y-auto space-y-4 bg-white rounded-lg p-4 border border-sideby-orange-100">
              {massagePrompts.length === 0 && !isLoading ? (
                <div className="text-center py-8 text-sideby-text-muted">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-sideby-orange-300" />
                  <p className="text-sm">Start a conversation to refine your idea!</p>
                  <p className="text-xs mt-1">Ask me to make it shorter, turn it into a blog post, or anything else.</p>
                </div>
              ) : (
                <>
                  {massagePrompts.map((massage) => (
                    <MassageMessage
                      key={massage.id}
                      massage={massage}
                      onCopyResponse={handleReplaceContent}
                    />
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-sideby-text-primary">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((quickPrompt) => (
                  <Button
                    key={quickPrompt}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(quickPrompt)}
                    disabled={isLoading}
                    className="text-xs border-sideby-orange-200 hover:bg-sideby-orange-50"
                  >
                    {quickPrompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="How would you like to refine your idea? (Press Ctrl+Enter to send)"
                className="min-h-[80px] resize-none border-sideby-orange-200 focus:border-sideby-orange-400"
                disabled={isLoading}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-sideby-text-muted">
                  Press Shift+Enter for a new line, Enter to send
                </p>
                <ThinkingButton
                  onClick={handleSendPrompt}
                  disabled={!prompt.trim()}
                  isThinking={isLoading}
                  size="sm"
                  className="bg-sideby-orange-500 hover:bg-sideby-orange-600 text-white"
                  thinkingText="Sending..."
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};