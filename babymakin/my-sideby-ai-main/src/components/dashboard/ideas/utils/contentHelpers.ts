
/**
 * Format content snippets for display with proper truncation
 */
export const formatContentSnippet = (content: string, maxLength: number = 150): string => {
  if (!content) return '';
  
  if (content.length <= maxLength) return content;
  
  // Try to detect if content is JSON
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      // If it's a learning assessment, show the summary
      if (parsed.type === 'learning_assessment' && parsed.summary) {
        return parsed.summary.length > maxLength 
          ? parsed.summary.substring(0, maxLength) + '...' 
          : parsed.summary;
      }
      // For other JSON content, return a generic message
      return 'Structured content (click to view details)';
    }
  } catch {
    // Not JSON, proceed with normal text handling
  }
  
  return content.substring(0, maxLength) + '...';
};
