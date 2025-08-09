
import React from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const renderContent = () => {
    if (role === 'assistant') {
      return (
        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:my-1">
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </div>
      );
    }
    
    return (
      <div className="whitespace-pre-wrap text-sm">
        {content}
      </div>
    );
  };

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};
