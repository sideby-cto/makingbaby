import { useCallback, useRef } from 'react';

interface UseUpduoEmbeddingProps {
  onError?: (error: string) => void;
}

export const useUpduoEmbedding = ({ 
  onError 
}: UseUpduoEmbeddingProps = {}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = useCallback(() => {
    console.log('Upduo iframe loaded successfully');
  }, []);

  const buildIframeUrl = useCallback((baseUrl: string, communityCode: string) => {
    const url = new URL(baseUrl);
    url.searchParams.set('communityCode', communityCode);
    return url.toString();
  }, []);

  return {
    iframeRef,
    handleIframeLoad,
    buildIframeUrl
  };
};